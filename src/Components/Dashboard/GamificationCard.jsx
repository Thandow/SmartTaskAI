import React from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, Target } from "lucide-react";

export default function GamificationCard({ profile }) {
  const points = profile?.total_points || 0;
  const streak = profile?.current_streak || 0;
  const level = profile?.level || 1;
  const nextLevel = level * 100;
  const progress = Math.min((points % 100) / 100 * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-white/5 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Achievements</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 font-medium">
          Level {level}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <Star className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{points}</p>
          <p className="text-[10px] text-white/30">Points</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{streak}</p>
          <p className="text-[10px] text-white/30">Streak</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <Target className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{profile?.tasks_completed || 0}</p>
          <p className="text-[10px] text-white/30">Done</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/40">Next level</span>
          <span className="text-white/30">{points % 100}/{100}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          />
        </div>
      </div>
    </motion.div>
  );
}
