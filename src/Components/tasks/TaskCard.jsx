import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, AlertTriangle, Trash2, Pencil, Sparkles, UserCheck, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import moment from "moment";

const priorityConfig = {
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Low" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Medium" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "High" },
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
};

const categoryIcons = {
  work: "💼", personal: "🏠", study: "📚", health: "💪", meeting: "🤝", errand: "🏃", other: "📌"
};

export default function TaskCard({ task, onToggle, onDelete, onEdit, index = 0 }) {
  const isDone = task.status === "done";
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;
  const p = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "group rounded-xl border p-4 transition-all hover:bg-white/[0.03]",
        isDone ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.02] border-white/5",
        isOverdue && "border-red-500/20 bg-red-500/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Circle className={cn("h-5 w-5", isOverdue ? "text-red-400" : "text-white/20 hover:text-white/40")} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">{categoryIcons[task.category] || "📌"}</span>
            <h4 className={cn("text-sm font-medium truncate", isDone && "line-through text-white/40", !isDone && "text-white")}>
              {task.title}
            </h4>
            {task.ai_notes && (
              <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={cn("text-[10px] px-2 py-0 border", p.bg, p.color, p.border)}>
              {p.label}
            </Badge>
            {task.due_date && (
              <span className={cn("text-[11px] flex items-center gap-1", isOverdue ? "text-red-400" : "text-white/30")}>
                {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {moment(task.due_date).fromNow()}
              </span>
            )}
            {task.estimated_minutes && (
              <span className="text-[11px] text-white/20">~{task.estimated_minutes}min</span>
            )}
            {task.points && (
              <span className="text-[11px] text-yellow-400/50">+{task.points}pts</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
