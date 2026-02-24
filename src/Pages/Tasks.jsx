import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { ListTodo, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SmartTaskInput from "../components/tasks/SmartTaskInput";
import TaskCard from "../components/tasks/TaskCard";
import TaskEditDialog from "../components/tasks/TaskEditDialog";
import TaskFilters from "../components/tasks/TaskFilters";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [editTask, setEditTask] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "all", priority: "all", category: "all" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const filtered = tasks.filter(t => {
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.category !== "all" && t.category !== filters.category) return false;
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
  });

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const updates = { status: newStatus };
    if (newStatus === "done") updates.completed_date = new Date().toISOString();
    await base44.entities.Task.update(task.id, updates);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const deleteTask = async (task) => {
    await base44.entities.Task.delete(task.id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const saveTask = async (id, data) => {
    if (id) await base44.entities.Task.update(id, data);
    else await base44.entities.Task.create(data);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Task Manager</h1>
            <p className="text-xs text-white/40">{tasks.length} total tasks</p>
          </div>
        </div>
        <Button onClick={() => { setEditTask({}); setEditOpen(true); }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Plus className="h-4 w-4 mr-1" /> Manual Add
        </Button>
      </div>

      <SmartTaskInput onTaskCreated={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <TaskFilters filters={filters} onChange={setFilters} />
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={(t) => { setEditTask(t); setEditOpen(true); }}
            />
          ))}
        </AnimatePresence>
        {!isLoading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-white/30 text-sm">No tasks found</p>
          </motion.div>
        )}
      </div>

      <TaskEditDialog task={editTask} open={editOpen} onOpenChange={setEditOpen} onSave={saveTask} />
    </div>
  );
}
