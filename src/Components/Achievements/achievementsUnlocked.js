import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, X } from "lucide-react";

export default function AchievementUnlock({ achievement, onClose }) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-xl shadow-2xl shadow-yellow-500/20 min-w-[300px]"
        >
          {/* Particle burst */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i / 8) * Math.PI * 2) * 40,
                y: Math.sin((i / 8) * Math.PI * 2) * 40,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-yellow-400"
              style={{ marginLeft: -4, marginTop: -4 }}
            />
          ))}

          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0"
          >
            <span className="text-2xl">{achievement.emoji || "🏆"}</span>
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-widest mb-0.5">Achievement Unlocked!</p>
              <p className="text-sm font-bold text-white">{achievement.name}</p>
              <p className="text-xs text-white/50">{achievement.description}</p>
            </motion.div>
          </div>

          <button onClick={onClose} className="text-white/30 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
