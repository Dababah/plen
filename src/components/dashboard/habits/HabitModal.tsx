"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  Plus,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HabitFormData) => Promise<void>;
  habit?: HabitEditData | null;
  dict: any;
}

interface HabitFormData {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  frequency: "daily" | "custom";
  scheduleDays?: string[];
  items?: string[];
}

interface HabitEditData {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  frequency: string;
  scheduleDays?: string | null;
  items?: { id: string; title: string }[];
}

const HABIT_ICONS = [
  { emoji: "⚡", label: "Energy" },
  { emoji: "🕌", label: "Prayer" },
  { emoji: "📖", label: "Reading" },
  { emoji: "🏃", label: "Running" },
  { emoji: "💪", label: "Fitness" },
  { emoji: "🧘", label: "Meditate" },
  { emoji: "💧", label: "Water" },
  { emoji: "🎯", label: "Focus" },
  { emoji: "📝", label: "Journal" },
  { emoji: "💤", label: "Sleep" },
];

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Sen",
  tue: "Sel",
  wed: "Rab",
  thu: "Kam",
  fri: "Jum",
  sat: "Sab",
  sun: "Min",
};

const HabitModal = ({ isOpen, onClose, onSave, habit, dict }: HabitModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [frequency, setFrequency] = useState<"daily" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>(DAY_KEYS);
  const [subItems, setSubItems] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || "");
        const iconIdx = HABIT_ICONS.findIndex((i) => i.emoji === habit.icon);
        setSelectedIcon(iconIdx >= 0 ? iconIdx : 0);
        setFrequency(habit.frequency === "custom" ? "custom" : "daily");
        if (habit.scheduleDays) {
          try {
            setSelectedDays(JSON.parse(habit.scheduleDays));
          } catch {
            setSelectedDays(DAY_KEYS);
          }
        } else {
          setSelectedDays(DAY_KEYS);
        }
        setSubItems(habit.items?.map((i) => i.title) || []);
      } else {
        setTitle("");
        setDescription("");
        setSelectedIcon(0);
        setFrequency("daily");
        setSelectedDays(DAY_KEYS);
        setSubItems([]);
      }
      setNewItemText("");
    }
  }, [isOpen, habit]);

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

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addSubItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setSubItems((prev) => [...prev, text]);
    setNewItemText("");
  };

  const removeSubItem = (idx: number) => {
    setSubItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: habit?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        icon: HABIT_ICONS[selectedIcon]?.emoji,
        frequency,
        scheduleDays: frequency === "custom" ? selectedDays : undefined,
        items: subItems.length > 0 ? subItems : undefined,
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
            className="relative w-full max-w-[440px] max-h-[85vh] bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {habit ? dict.habits?.editHabit || "Edit Habit" : dict.habits?.createHabit || "Create Habit"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {dict.habits?.modalDesc || "Build consistency, one day at a time"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-300 hover:text-zinc-900 rounded-full transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Icon Picker */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {HABIT_ICONS.map((icon, idx) => (
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
                  {dict.habits?.habitTitle || "Habit Name"}
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={dict.habits?.titlePlaceholder || "e.g. Solat, Ngaji, Olahraga"}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.habits?.habitDesc || "Description"}{" "}
                  <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={dict.habits?.descPlaceholder || "e.g. Solat tepat waktu"}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.habits?.schedule || "Schedule"}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("daily");
                      setSelectedDays(DAY_KEYS);
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                      frequency === "daily"
                        ? "bg-zinc-900 text-white shadow-md"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {dict.habits?.everyDay || "Every Day"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency("custom")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                      frequency === "custom"
                        ? "bg-zinc-900 text-white shadow-md"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {dict.habits?.specificDays || "Specific Days"}
                  </button>
                </div>

                {frequency === "custom" && (
                  <div className="flex gap-1.5 pt-1">
                    {DAY_KEYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                          selectedDays.includes(day)
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {DAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-items */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.habits?.subItems || "Sub-Items"}{" "}
                  <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </label>

                {subItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 flex-1 truncate">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeSubItem(idx)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSubItem(); }
                    }}
                    placeholder={dict.habits?.addItemPlaceholder || "e.g. Subuh, Push-up set 1..."}
                    className="flex-1 h-9 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:border-zinc-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addSubItem}
                    disabled={!newItemText.trim()}
                    className="h-9 px-3 bg-zinc-900 text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-zinc-800 transition-all flex items-center gap-1"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center gap-3 sticky bottom-0 bg-white">
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
                    {habit ? dict.finance?.modals?.common?.save || "Save" : dict.habits?.createHabit || "Create Habit"}
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

export default HabitModal;
