import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Lock, Star, Flame, Target, Zap } from "lucide-react";
import { ACHIEVEMENTS } from "../components/achievements/achievementsData";
import { cn } from "@/lib/utils";

export default function Achievements() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profile"],
    queryFn: () => base44.entities.UserProfile.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 500),
  });

  const profile = profiles[0];
  const earnedIds = (profile?.achievements || []).map(a => a.id);
  const earned = ACHIEVEMENTS.filter(a => earnedIds.includes(a.id));
  const locked = ACHIEVEMENTS.filter(a => !earnedIds.includes(a.id));

  const totalPoints = profile?.total_points || 0;
  const level = profile?.level || 1;
  const progress = Math.min((totalPoints % 100) / 100 * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Achievements</h1>
          <p className="text-xs text-white/40">{earned.length} of {ACHIEVEMENTS.length} unlocked</p>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
            <div>
              <p className="text-white/40 text-xs">Current Level</p>
              <p className="text-2xl font-bold text-white">Level {level}</p>
              <p className="text-xs text-yellow-400">{totalPoints} total points</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{profile?.current_streak || 0}</p>
              <p className="text-[10px] text-white/30">Streak</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <Target className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{profile?.tasks_completed || 0}</p>
              <p className="text-[10px] text-white/30">Done</p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40">Progress to Level {level + 1}</span>
            <span className="text-white/30">{totalPoints % 100}/100 XP</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Earned Achievements */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            Unlocked ({earned.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {earned.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl" />
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {ach.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{ach.name}</p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{ach.description}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <span className="text-[10px] text-yellow-400 font-medium">+{ach.points} XP</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div>
        <h2 className="text-sm font-semibold text-white/30 mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locked.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 grayscale opacity-40">
                  {ach.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/50">{ach.name}</p>
                  <p className="text-[11px] text-white/25 mt-0.5 leading-snug">{ach.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Lock className="h-3 w-3 text-white/20" />
                    <span className="text-[10px] text-white/20">+{ach.points} XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
