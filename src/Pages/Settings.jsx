import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, User, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profile"],
    queryFn: () => base44.entities.UserProfile.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const [prefs, setPrefs] = useState({
    smart_reminders: true,
    daily_summary: true,
    achievement_alerts: true,
    email_task_assigned: true,
    email_task_comment: true,
    email_deadline: false,
    preferred_work_hours: "morning",
    daily_task_limit: 10,
  });

  useEffect(() => {
    if (profile) {
      setPrefs({
        smart_reminders: profile.notification_preferences?.smart_reminders ?? true,
        daily_summary: profile.notification_preferences?.daily_summary ?? true,
        achievement_alerts: profile.notification_preferences?.achievement_alerts ?? true,
        email_task_assigned: profile.notification_preferences?.email_task_assigned ?? true,
        email_task_comment: profile.notification_preferences?.email_task_comment ?? true,
        email_deadline: profile.notification_preferences?.email_deadline ?? false,
        preferred_work_hours: profile.preferred_work_hours || "morning",
        daily_task_limit: profile.daily_task_limit || 10,
      });
    }
  }, [profile]);

  const savePrefs = async () => {
    const data = {
      preferred_work_hours: prefs.preferred_work_hours,
      daily_task_limit: prefs.daily_task_limit,
      notification_preferences: {
        smart_reminders: prefs.smart_reminders,
        daily_summary: prefs.daily_summary,
        achievement_alerts: prefs.achievement_alerts,
        email_task_assigned: prefs.email_task_assigned,
        email_task_comment: prefs.email_task_comment,
        email_deadline: prefs.email_deadline,
      },
    };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      await base44.entities.UserProfile.create({ ...data, total_points: 0, current_streak: 0, level: 1, tasks_completed: 0 });
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Settings saved!");
  };

  const clearAllTasks = async () => {
    if (!confirm("Are you sure you want to delete all tasks? This cannot be undone.")) return;
    const tasks = await base44.entities.Task.list("-created_date", 500);
    for (const t of tasks) {
      await base44.entities.Task.delete(t.id);
    }
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    toast.success("All tasks cleared");
  };

  const resetProfile = async () => {
    if (!confirm("Reset your profile? Points and streaks will be lost.")) return;
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        total_points: 0, current_streak: 0, longest_streak: 0, level: 1, tasks_completed: 0, achievements: [],
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile reset");
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-xs text-white/40">Customize your experience</p>
        </div>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-violet-400" />
          <h3 className="font-semibold text-white text-sm">Profile</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-white/50 text-xs">Name</Label>
            <p className="text-sm text-white mt-1">{user?.full_name || "—"}</p>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Email</Label>
            <p className="text-sm text-white mt-1">{user?.email || "—"}</p>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold text-white text-sm">Productivity Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white/60 text-xs">Preferred Work Hours</Label>
            <Select value={prefs.preferred_work_hours} onValueChange={v => setPrefs({ ...prefs, preferred_work_hours: v })}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a3a] border-white/10">
                <SelectItem value="morning">Morning (6-12)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12-6)</SelectItem>
                <SelectItem value="evening">Evening (6-10)</SelectItem>
                <SelectItem value="night">Night (10-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-white/60 text-xs">Daily Task Limit</Label>
            <Input type="number" value={prefs.daily_task_limit}
              onChange={e => setPrefs({ ...prefs, daily_task_limit: Number(e.target.value) })}
              className="w-20 bg-white/5 border-white/10 text-white text-xs h-8 text-center" />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-amber-400" />
          <h3 className="font-semibold text-white text-sm">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "smart_reminders", label: "Smart Reminders", desc: "AI-timed task reminders" },
            { key: "daily_summary", label: "Daily Summary", desc: "Morning productivity briefing" },
            { key: "achievement_alerts", label: "Achievement Alerts", desc: "Celebrate your wins" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">{n.label}</p>
                <p className="text-[10px] text-white/30">{n.desc}</p>
              </div>
              <Switch
                checked={prefs[n.key]}
                onCheckedChange={v => setPrefs({ ...prefs, [n.key]: v })}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Email Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold text-white text-sm">Email Alerts</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "email_task_assigned", label: "Task Assigned", desc: "Email when a task is assigned to you" },
            { key: "email_task_comment", label: "Task Comments", desc: "Email when someone comments on your task" },
            { key: "email_deadline", label: "Deadline Reminders", desc: "Email 24h before a task is due" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">{n.label}</p>
                <p className="text-[10px] text-white/30">{n.desc}</p>
              </div>
              <Switch
                checked={prefs[n.key]}
                onCheckedChange={v => setPrefs({ ...prefs, [n.key]: v })}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl bg-red-500/[0.03] border border-red-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-red-400" />
          <h3 className="font-semibold text-white text-sm">Data & Privacy</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Clear All Tasks</p>
              <p className="text-[10px] text-white/30">Delete all tasks permanently</p>
            </div>
            <Button onClick={clearAllTasks} variant="outline" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10 text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Reset Profile</p>
              <p className="text-[10px] text-white/30">Reset points, streaks & achievements</p>
            </div>
            <Button onClick={resetProfile} variant="outline" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10 text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Log Out</p>
              <p className="text-[10px] text-white/30">Sign out of your account</p>
            </div>
            <Button onClick={() => base44.auth.logout()} variant="outline" size="sm" className="text-white/50 border-white/10 hover:bg-white/5 text-xs">
              <LogOut className="h-3 w-3 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={savePrefs} className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
