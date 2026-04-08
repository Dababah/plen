"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Calendar,
  AlignLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GoalFormData) => Promise<void>;
  goal?: GoalEditData | null;
  dict: any;
}

interface GoalFormData {
  id?: string;
  title: string;
  description?: string;
  targetDate?: string;
}

interface GoalEditData {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | Date | null;
}

const GOAL_ICONS = [
  { emoji: "🎯", label: "Target" },
  { emoji: "🚀", label: "Launch" },
  { emoji: "📚", label: "Study" },
  { emoji: "💪", label: "Fitness" },
  { emoji: "💰", label: "Finance" },
  { emoji: "🎨", label: "Creative" },
  { emoji: "🌍", label: "Travel" },
  { emoji: "💼", label: "Career" },
];

const GoalModal = ({ isOpen, onClose, onSave, goal, dict }: GoalModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || "");
        if (goal.targetDate) {
          const d = new Date(goal.targetDate);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setTargetDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setTargetDate("");
        }
      } else {
        setTitle("");
        setDescription("");
        setTargetDate("");
        setSelectedIcon(0);
      }
    }
  }, [isOpen, goal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: goal?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-[420px] bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {goal ? dict.goals?.editGoal || "Edit Goal" : dict.goals?.createGoal || "Create Goal"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {dict.goals?.modalDesc || "Define your long-term objective"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-zinc-900 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Icon Picker */}
              <div className="flex items-center gap-1.5">
                {GOAL_ICONS.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIcon(idx)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all",
                      selectedIcon === idx
                        ? "bg-zinc-900 shadow-md scale-110"
                        : "bg-slate-50 hover:bg-slate-100 hover:scale-105"
                    )}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.goals?.goalTitle || "Goal Title"}
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={dict.goals?.titlePlaceholder || "e.g. Learn TypeScript, Run a marathon"}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft size={10} />
                  {dict.goals?.goalDesc || "Description"} <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={dict.goals?.descPlaceholder || "Describe what you want to achieve..."}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none"
                />
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={10} />
                  {dict.goals?.targetDate || "Target Date"} <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-all active:scale-95"
              >
                {dict.finance?.modals?.common?.cancel || "Cancel"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !title.trim()}
                className="flex-1 h-11 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles size={12} />
                    {goal ? dict.finance?.modals?.common?.save || "Save" : dict.goals?.createGoal || "Create Goal"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default GoalModal;
