import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "../tasks/TaskCard";
import { ListTodo } from "lucide-react";

export default function TodaysTasks({ tasks, onToggle, onDelete, onEdit }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks
    .filter(t => t.status !== "done")
    .sort((a, b) => {
      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
    });

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Upcoming Tasks</h3>
        </div>
        <span className="text-xs text-white/30">{todayTasks.length} pending</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {todayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-sm text-white/30">All caught up! 🎉</p>
              <p className="text-xs text-white/15 mt-1">Add a new task to get started</p>
            </motion.div>
          ) : (
            todayTasks.slice(0, 5).map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
