import React, { useState, useEffect } from "react";
import { Sparkles, Sun, Moon, Sunset } from "lucide-react";
import { motion } from "framer-motion";

export default function GreetingHeader({ userName, tasksToday, tasksDone }) {
  const [greeting, setGreeting] = useState("");
  const [Icon, setIcon] = useState(Sun);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) { setGreeting("Good morning"); setIcon(Sun); }
    else if (h < 17) { setGreeting("Good afternoon"); setIcon(Sunset); }
    else { setGreeting("Good evening"); setIcon(Moon); }
  }, []);

  const firstName = userName?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-600/20 border border-white/5 p-6 md:p-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-white/50 font-medium">{greeting}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {firstName} <span className="text-white/40">—</span>{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              let's be productive
            </span>
          </h1>
          <p className="text-sm text-white/40 mt-2">
            {tasksToday > 0
              ? `You have ${tasksToday} tasks today · ${tasksDone} completed`
              : "No tasks scheduled for today. Time to plan!"}
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-xs text-white/60">AI is ready to help</span>
        </div>
      </div>
    </motion.div>
  );
}
