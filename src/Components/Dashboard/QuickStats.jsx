import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";

const stats = [
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", glow: "shadow-emerald-500/20" },
  { key: "pending", label: "Pending", icon: Clock, color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, color: "from-red-500 to-rose-500", glow: "shadow-red-500/20" },
  { key: "streak", label: "Day Streak", icon: Flame, color: "from-violet-500 to-purple-500", glow: "shadow-violet-500/20" },
];

export default function QuickStats({ data }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 md:p-5 hover:bg-white/[0.06] transition-all group"
        >
          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ${s.glow} mb-3`}>
            <s.icon className="h-4 w-4 text-white" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{data[s.key] ?? 0}</p>
          <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
