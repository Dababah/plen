"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { createPortal } from "react-dom";

interface StreakCelebrationProps {
  milestone: number;
  habitTitle: string;
  onComplete: () => void;
}

export default function StreakCelebration({ milestone, habitTitle, onComplete }: StreakCelebrationProps) {
  useEffect(() => {
    const duration = 4000;
    const end = Date.now() + duration;

    // Fire confetti from both edges
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ef4444", "#f97316", "#eab308"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ef4444", "#f97316", "#eab308"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const content = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Dim backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onComplete}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm w-full"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Flame className="w-32 h-32 md:w-48 md:h-48 text-orange-500 drop-shadow-[0_0_50px_rgba(249,115,22,0.8)]" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <span className="text-4xl md:text-6xl font-black text-white drop-shadow-md">
              {milestone}
            </span>
          </div>
        </div>
        
        <h2 className="mt-8 text-2xl md:text-4xl font-extrabold text-white tracking-tight uppercase italic drop-shadow-lg">
          Day Streak!
        </h2>
        <p className="mt-2 text-lg text-orange-200 font-medium">
          Habit: <span className="text-white font-bold">{habitTitle}</span>
        </p>
        
        <button
          onClick={onComplete}
          className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20 hover:scale-105 active:scale-95"
        >
          Keep it up 🔥
        </button>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
}
