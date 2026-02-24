import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GreetingHeader from "../components/dashboard/GreetingHeader";
import QuickStats from "../components/dashboard/QuickStats";
import AISuggestions from "../components/dashboard/AISuggestions";
import MoodSelector from "../components/dashboard/MoodSelector";
import TodaysTasks from "../components/dashboard/TodaysTasks";
import GamificationCard from "../components/dashboard/GamificationCard";
import SmartTaskInput from "../components/tasks/SmartTaskInput";
import TaskEditDialog from "../components/tasks/TaskEditDialog";
import AIChatBot from "../components/chat/AIChatBot";
import AchievementUnlock from "../components/achievements/AchievementUnlock";
import { checkNewAchievements } from "../components/achievements/achievementsData";
import DeadlineChecker from "../components/notifications/DeadlineChecker";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [editTask, setEditTask] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState("normal");
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 100),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profile"],
    queryFn: () => base44.entities.UserProfile.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const updateMood = async (newMood) => {
    setMood(newMood);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { current_mood: newMood });
    } else if (user) {
      await base44.entities.UserProfile.create({ current_mood: newMood, total_points: 0, current_streak: 0, level: 1, tasks_completed: 0 });
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const updates = { status: newStatus };
    if (newStatus === "done") {
      updates.completed_date = new Date().toISOString();
      const newPoints = (profile?.total_points || 0) + (task.points || 10);
      const newCompleted = (profile?.tasks_completed || 0) + 1;
      const newLevel = Math.floor(newPoints / 100) + 1;

      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          total_points: newPoints,
          tasks_completed: newCompleted,
          level: newLevel,
        });
      } else if (user) {
        await base44.entities.UserProfile.create({
          total_points: task.points || 10, tasks_completed: 1, level: 1,
          current_streak: 1, longest_streak: 1,
        });
      }

      // Check achievements
      const allTasks = await base44.entities.Task.list("-created_date", 500);
      const doneTasks = allTasks.filter(t => t.status === "done");
      const categories = new Set(doneTasks.map(t => t.category));
      const hour = new Date().getHours();
      const stats = {
        tasksCompleted: newCompleted,
        streak: profile?.current_streak || 0,
        level: newLevel,
        criticalDone: doneTasks.filter(t => t.priority === "critical").length,
        earlyBird: hour < 9,
        categoriesDone: categories.size,
      };
      const existingIds = (profile?.achievements || []).map(a => a.id);
      const unlocked = checkNewAchievements(stats, existingIds);
      if (unlocked.length > 0) {
        setNewAchievement(unlocked[0]);
        const updatedAchievements = [
          ...(profile?.achievements || []),
          ...unlocked.map(a => ({ id: a.id, name: a.name, earned_date: new Date().toISOString().split("T")[0] }))
        ];
        if (profile) {
          await base44.entities.UserProfile.update(profile.id, { achievements: updatedAchievements });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    await base44.entities.Task.update(task.id, updates);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const deleteTask = async (task) => {
    await base44.entities.Task.delete(task.id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setEditOpen(true);
  };

  const saveTask = async (id, data) => {
    if (id) await base44.entities.Task.update(id, data);
    else await base44.entities.Task.create(data);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const completedToday = tasks.filter(t => t.status === "done" && t.completed_date?.startsWith(todayStr)).length;
  const pending = tasks.filter(t => t.status !== "done" && t.status !== "missed").length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "done").length;

  return (
    <div className="space-y-5">
      <GreetingHeader
        userName={user?.full_name}
        tasksToday={tasks.filter(t => t.due_date?.startsWith(todayStr)).length}
        tasksDone={completedToday}
      />

      <QuickStats data={{
        completed: completedToday,
        pending,
        overdue,
        streak: profile?.current_streak || 0,
      }} />

      <SmartTaskInput onTaskCreated={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <TodaysTasks tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onEdit={handleEdit} />
        </div>
        <div className="space-y-5">
          <MoodSelector current={mood} onChange={updateMood} />
          <AISuggestions tasks={tasks} mood={mood} />
          <GamificationCard profile={profile} />
        </div>
      </div>

      <TaskEditDialog task={editTask} open={editOpen} onOpenChange={setEditOpen} onSave={saveTask} />
      <AIChatBot tasks={tasks} />
      <AchievementUnlock achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      <DeadlineChecker user={user} tasks={tasks} />
    </div>
  );
}
