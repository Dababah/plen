"use client";

import React, { useMemo, useState } from "react";
import { 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR, getDaysRemaining } from "@/lib/finance-utils";
import { Debt } from "@/lib/finance-types";
import DebtModal from "./forms/DebtModal";
import DebtPaymentModal from "./forms/DebtPaymentModal";

export interface DebtManagerProps {
  debts: Debt[];
  selectedDate: Date;
  dict: any;
  onAdd: (debt: Omit<Debt, 'id' | 'paidAmount' | 'status'>) => Promise<void>;
  onPay: (debtId: string, amount: number, date?: string, autoTransaction?: boolean) => Promise<void>;
}

export default function DebtManager({ debts, selectedDate, dict, onAdd, onPay }: DebtManagerProps) {
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);

  const { activeDebts, paidDebts } = useMemo(() => {
    return {
      activeDebts: debts.filter(d => d.status === 'aktif' || d.paidAmount < d.totalDebt),
      paidDebts: debts.filter(d => d.status === 'lunas' || d.paidAmount >= d.totalDebt)
    };
  }, [debts]);

  const totalOutstanding = activeDebts.reduce((acc, d) => acc + (d.totalDebt - d.paidAmount), 0);
  const monthlyObligation = activeDebts.reduce((acc, d) => acc + d.monthlyPayment, 0);

  const handleOpenAddDebt = () => {
    setSelectedDebt(undefined);
    setIsDebtModalOpen(true);
  };

  const handleOpenPayment = (debt?: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentModalOpen(true);
  };

  const DebtCard = ({ debt, isPaid }: { debt: Debt, isPaid?: boolean }) => {
    const remaining = Math.max(0, debt.totalDebt - debt.paidAmount);
    const progress = Math.min(100, (debt.paidAmount / debt.totalDebt) * 100);
    const daysLeft = getDaysRemaining(debt.dueDayOfMonth);
    const isUrgent = daysLeft <= 3 && !isPaid;

    return (
      <div className={cn(
        "bg-white rounded-2xl border shadow-sm transition-all overflow-hidden flex flex-col gap-4 p-5",
        isPaid ? "border-slate-100 opacity-60 bg-slate-50/50" : "border-slate-100 hover:border-zinc-300",
        isUrgent && "border-amber-200 bg-amber-50/30"
      )}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-zinc-900 tracking-tight leading-none uppercase">{debt.name}</h3>
              {isPaid && <CheckCircle2 size={12} className="text-emerald-500" />}
              {isUrgent && <AlertCircle size={12} className="text-amber-500 animate-pulse" />}
            </div>
            <p className="text-[9px] font-bold text-slate-400">{dict.finance.debts.started.replace('{date}', new Date(debt.startDate).toLocaleDateString(dict.lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' }))}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-black text-zinc-900 leading-none">{formatIDR(remaining)}</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{dict.finance.debts.remaining}</p>
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-end px-0.5">
              <span className="text-[9px] font-black text-zinc-900">{dict.finance.debts.paidPercent.replace('{percent}', progress.toFixed(0))}</span>
              <span className="text-[9px] font-bold text-slate-300">{dict.finance.debts.target.replace('{amount}', formatIDR(debt.totalDebt))}</span>
           </div>
           <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000",
                  isPaid ? "bg-emerald-500" : "bg-zinc-900"
                )}
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>

        {!isPaid && (
          <div className="pt-4 border-t border-slate-50 mt-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar size={10} className="text-slate-400" />
                <p className="text-[9px] font-bold text-slate-500">{dict.finance.debts.dueIn.replace('{days}', daysLeft.toString())}</p>
              </div>
              <p className="text-[10px] font-black text-zinc-900">{formatIDR(debt.monthlyPayment)}{dict.finance.debts.perMonth}</p>
            </div>
            
            <button 
              onClick={() => handleOpenPayment(debt)}
              className="w-full h-9 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              {dict.finance.debts.pay}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-8 group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{dict.finance.debts.totalOutstanding}</p>
            <h2 className="text-xl font-black text-zinc-900 leading-none">{formatIDR(totalOutstanding)}</h2>
          </div>
          <div className="w-px h-8 bg-slate-100 group-hover:bg-zinc-200 transition-colors" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{dict.finance.debts.monthlyObligation}</p>
            <h2 className="text-xl font-black text-zinc-900 leading-none">{formatIDR(monthlyObligation)}</h2>
          </div>
        </div>

        <button 
          onClick={handleOpenAddDebt}
          className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <Plus size={12} />
          {dict.finance.debts.add}
        </button>
      </div>

      <div className="space-y-6">
        {/* Active Debts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <AlertCircle size={12} className="text-amber-500" />
             <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.finance.debts.active}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDebts.map(debt => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
            {activeDebts.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 opacity-50">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <p className="text-[11px] font-semibold text-slate-400">{dict.finance.debts.empty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Paid Debts */}
        {paidDebts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
               <History size={12} className="text-slate-400" />
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.finance.debts.paid}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paidDebts.map(debt => (
                <DebtCard key={debt.id} debt={debt} isPaid />
              ))}
            </div>
          </div>
        )}
      </div>

      {isDebtModalOpen && (
        <DebtModal 
          dict={dict}
          onClose={() => setIsDebtModalOpen(false)}
          onSave={onAdd}
        />
      )}

      {isPaymentModalOpen && (
        <DebtPaymentModal 
          dict={dict}
          debts={debts}
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={onPay}
        />
      )}
    </div>
  );
}
