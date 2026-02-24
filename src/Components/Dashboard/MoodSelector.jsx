import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const moods = [
  { value: "energized", emoji: "⚡", label: "Energized", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30" },
  { value: "normal", emoji: "😊", label: "Normal", color: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
  { value: "tired", emoji: "😴", label: "Tired", color: "from-purple-500/20 to-violet-500/20 border-purple-500/30" },
  { value: "overwhelmed", emoji: "😰", label: "Overwhelmed", color: "from-red-500/20 to-rose-500/20 border-red-500/30" },
];

export default function MoodSelector({ current, onChange }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white/60 mb-3">How are you feeling?</h3>
      <div className="flex gap-2 flex-wrap">
        {moods.map((m) => (
          <motion.button
            key={m.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(m.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
              current === m.value
                ? `bg-gradient-to-r ${m.color} text-white`
                : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70"
            )}
          >
            <span className="text-base">{m.emoji}</span>
            {m.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
