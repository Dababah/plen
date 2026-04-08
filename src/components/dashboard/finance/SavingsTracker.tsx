"use client";

import React, { useMemo, useState } from "react";
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/finance-utils";
import { SavingGoal } from "@/lib/finance-types";
import SavingGoalModal from "./forms/SavingGoalModal";
import SavingDepositModal from "./forms/SavingDepositModal";

export interface SavingsTrackerProps {
  savings: SavingGoal[];
  selectedDate: Date;
  dict: any;
  onAdd: (goal: Omit<SavingGoal, 'id' | 'currentAmount'>) => Promise<void>;
  onContribute: (goalId: string, amount: number, date?: string) => Promise<void>;
}

export default function SavingsTracker({ savings, selectedDate, dict, onAdd, onContribute }: SavingsTrackerProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | undefined>(undefined);

  const handleOpenAddGoal = () => {
    setSelectedGoal(undefined);
    setIsGoalModalOpen(true);
  };

  const handleOpenDeposit = (goal?: SavingGoal) => {
    setSelectedGoal(goal);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-xl font-black text-zinc-900 leading-none">{dict.finance.savings.title}</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{dict.finance.savings.subtitle}</p>
        </div>
        <button 
          onClick={handleOpenAddGoal}
          className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <Plus size={14} />
          {dict.finance.savings.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savings.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isAchieved = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal.id} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-5 hover:border-zinc-300 transition-all group overflow-hidden relative">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isAchieved ? "bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100" : "bg-zinc-50 text-zinc-900"
                  )}>
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 leading-none">{goal.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{dict.finance.savings.collect.replace('{amount}', formatIDR(goal.targetAmount))}</p>
                  </div>
                </div>
                {isAchieved && (
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-in slide-in-from-right duration-500">
                    <CheckCircle2 size={10} /> {dict.finance.savings.achieved}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 relative z-10">
                <div className="flex justify-between items-end">
                   <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dict.finance.savings.collected}</p>
                      <p className="text-[13px] font-black text-zinc-900">{formatIDR(goal.currentAmount)}</p>
                   </div>
                   <p className="text-[11px] font-black text-zinc-900">{Math.round(progress)}%</p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                   <div 
                     className={cn(
                       "h-full transition-all duration-1000",
                       isAchieved ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-zinc-900"
                     )}
                     style={{ width: `${Math.min(100, progress)}%` }}
                   />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex gap-3 relative z-10">
                <button 
                  onClick={() => handleOpenDeposit(goal)}
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-md"
                >
                  <Plus size={12} />
                  {dict.finance.savings.deposit}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                  {dict.finance.savings.history}
                </button>
              </div>

              {/* Decorative background logo */}
              <Target size={120} className="absolute -bottom-8 -right-8 text-slate-50 rotate-12 opacity-50 group-hover:scale-110 transition-transform pointer-events-none" />
            </div>
          );
        })}

        {savings.length === 0 && (
           <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-300">
                 <Inbox size={28} />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-[13px] font-black text-zinc-900">{dict.finance.savings.empty}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-10">{dict.finance.savings.emptySubtitle}</p>
              </div>
              <button 
                onClick={handleOpenAddGoal}
                className="mt-6 flex items-center gap-3 h-10 px-8 rounded-xl bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-zinc-800 active:scale-95 transition-all"
              >
                {dict.finance.savings.firstGoal}
              </button>
           </div>
        )}
      </div>

      {isGoalModalOpen && (
        <SavingGoalModal 
          dict={dict}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={onAdd}
        />
      )}

      {isDepositModalOpen && (
        <SavingDepositModal 
          dict={dict}
          savings={savings}
          onClose={() => setIsDepositModalOpen(false)}
          onSave={onContribute}
        />
      )}
    </div>
  );
}
