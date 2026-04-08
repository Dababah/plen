"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Wallet, 
  Save, 
  Home,
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Smartphone,
  Heart,
  Zap,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrency } from "@/lib/finance-utils";
import { BudgetCategory } from "@/lib/finance-types";

interface BudgetModalProps {
  onClose: () => void;
  onSave: (budget: Omit<BudgetCategory, 'id'>) => Promise<void>;
  initialData?: BudgetCategory;
  dict: any;
}

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

const PRESET_ICONS = [
  { name: "Wallet", icon: Wallet },
  { name: "Home", icon: Home },
  { name: "Utensils", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Car", icon: Car },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Smartphone", icon: Smartphone },
  { name: "Heart", icon: Heart },
  { name: "Zap", icon: Zap },
  { name: "Gift", icon: Gift },
];

export default function BudgetModal({ onClose, onSave, initialData, dict }: BudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [budgetStr, setBudgetStr] = useState(initialData ? formatCurrencyInput(initialData.budget) : "");
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
  const [selectedIconName, setSelectedIconName] = useState(initialData?.icon || "Wallet");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !budgetStr) return;

    setLoading(true);
    try {
      await onSave({
        name,
        budget: parseCurrency(budgetStr),
        color,
        icon: selectedIconName
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedIcon = PRESET_ICONS.find(i => i.name === selectedIconName)?.icon || Wallet;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/5 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500"
                style={{ backgroundColor: color }}
              >
                 {React.createElement(selectedIcon, { size: 20 })}
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-sm font-black text-zinc-900 leading-none">
                    {initialData ? dict.finance.modals.budget.edit : dict.finance.modals.budget.add}
                 </h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {dict.finance.modals.budget.desc}
                 </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-slate-400 transition-all"
            >
              <X size={16} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{dict.finance.modals.budget.name}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.finance.modals.budget.namePlaceholder}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit Bulanan (Rp)</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors">Rp</div>
               <input
                 type="text"
                 required
                 value={budgetStr}
                 onChange={(e) => setBudgetStr(formatCurrencyInput(e.target.value))}
                 placeholder="0"
                 className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
               />
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                <label className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">{dict.finance.modals.budget.appearance}</label>
             </div>
             
             <div className="grid grid-cols-5 gap-1.5">
                {PRESET_ICONS.map((item) => (
                   <button
                     key={item.name}
                     type="button"
                     onClick={() => setSelectedIconName(item.name)}
                     className={cn(
                       "h-9 rounded-lg flex items-center justify-center transition-all",
                       selectedIconName === item.name 
                         ? "bg-white shadow-md border border-slate-100 text-zinc-900" 
                         : "text-slate-300 hover:bg-slate-50 hover:text-slate-600"
                     )}
                   >
                      <item.icon size={16} />
                   </button>
                ))}
             </div>

             <div className="flex flex-wrap gap-2 pt-1 px-1">
               {PRESET_COLORS.map((c) => (
                 <button
                   key={c}
                   type="button"
                   onClick={() => setColor(c)}
                   className={cn(
                     "w-6 h-6 rounded-full border-2 transition-all active:scale-95",
                     color === c ? "border-zinc-900 scale-110 shadow-md" : "border-transparent"
                   )}
                   style={{ backgroundColor: c }}
                 />
               ))}
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 text-[10px] font-black text-slate-400 hover:text-zinc-900 transition-all uppercase tracking-widest"
            >
              {dict.finance.modals.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !name || !budgetStr}
              className="flex-1 h-11 bg-zinc-900 text-white rounded-xl text-[10px] font-black shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save size={14} />
              {loading ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
