"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Landmark, Calendar, Percent, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrency } from "@/lib/finance-utils";
import { Debt } from "@/lib/finance-types";

interface DebtModalProps {
  onClose: () => void;
  onSave: (data: Omit<Debt, "id" | "status">) => Promise<void>;
  initialData?: Debt;
  dict: any;
}

export default function DebtModal({ onClose, onSave, initialData, dict }: DebtModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [totalDebtStr, setTotalDebtStr] = useState(initialData ? formatCurrencyInput(initialData.totalDebt) : "");
  const [monthlyPaymentStr, setMonthlyPaymentStr] = useState(initialData ? formatCurrencyInput(initialData.monthlyPayment) : "");
  const [paidAmountStr, setPaidAmountStr] = useState(initialData ? formatCurrencyInput(initialData.paidAmount) : "0");
  const [startDate, setStartDate] = useState(initialData?.startDate ? initialData.startDate.split('T')[0] : "");
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(initialData?.dueDayOfMonth || 1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalDebtStr || !monthlyPaymentStr) return;

    setLoading(true);
    try {
      await onSave({
        name,
        totalDebt: parseCurrency(totalDebtStr),
        monthlyPayment: parseCurrency(monthlyPaymentStr),
        paidAmount: parseCurrency(paidAmountStr),
        startDate: new Date(startDate || new Date()).toISOString(),
        dueDayOfMonth
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/5 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <div>
              <h2 className="text-lg font-black text-zinc-900 leading-tight">
                {initialData ? dict.finance.modals.debt.edit : dict.finance.modals.debt.add}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dict.finance.modals.debt.desc}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90">
              <X size={18} className="text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1 flex items-center gap-2">
                 <Landmark size={10} /> {dict.finance.modals.debt.name}
              </label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={dict.finance.modals.debt.namePlaceholder} 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1">Total Hutang (Rp)</label>
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors">Rp</div>
                    <input 
                      value={totalDebtStr}
                      onChange={(e) => setTotalDebtStr(formatCurrencyInput(e.target.value))}
                      required
                      placeholder="0" 
                      className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1">{dict.finance.modals.debt.monthly}</label>
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors">Rp</div>
                    <input 
                      value={monthlyPaymentStr}
                      onChange={(e) => setMonthlyPaymentStr(formatCurrencyInput(e.target.value))}
                      required
                      placeholder="0" 
                      className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1">{dict.finance.modals.debt.paid}</label>
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors">Rp</div>
                    <input 
                      value={paidAmountStr}
                      onChange={(e) => setPaidAmountStr(formatCurrencyInput(e.target.value))}
                      placeholder="0" 
                      className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1 flex items-center gap-2">
                    <Calendar size={10} /> {dict.finance.modals.debt.startDate}
                 </label>
                 <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer"
                 />
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1">{dict.finance.modals.debt.dueDay}</label>
              <input 
                type="number"
                min={1}
                max={31}
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(parseInt(e.target.value))}
                required
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all"
              />
           </div>

           <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-zinc-900 hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-slate-100"
              >
                {dict.finance.modals.common.cancel}
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[1.5] h-12 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Simpan Cicilan</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
