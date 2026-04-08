"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Wallet, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrency } from "@/lib/finance-utils";
import { Debt } from "@/lib/finance-types";

interface DebtPaymentModalProps {
  onClose: () => void;
  onSave: (debtId: string, amount: number, date: string, autoTransaction: boolean) => Promise<void>;
  debts: Debt[];
  dict: any;
}

export default function DebtPaymentModal({ onClose, onSave, debts, dict }: DebtPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [debtId, setDebtId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoTransaction, setAutoTransaction] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeDebts = debts.filter(d => d.status === 'aktif');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtId || !amountStr || !date) return;

    setLoading(true);
    try {
      await onSave(debtId, parseCurrency(amountStr), new Date(date).toISOString(), autoTransaction);
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
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <div>
              <h2 className="text-lg font-black text-zinc-900 leading-tight">{dict.finance.modals.debtPayment.title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dict.finance.modals.debtPayment.desc}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90">
              <X size={18} className="text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1 flex items-center gap-2">{dict.finance.modals.debtPayment.select}</label>
              <select 
                value={debtId}
                onChange={(e) => setDebtId(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer"
              >
                <option value="">{dict.finance.modals.debtPayment.selectPlaceholder}</option>
                {activeDebts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
           </div>

           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1 flex items-center gap-2">
                 <Wallet size={10} /> {dict.finance.modals.debtPayment.amount}
              </label>
              <div className="relative group">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors">Rp</div>
                 <input 
                   value={amountStr}
                   onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                   required
                   placeholder="0" 
                   className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                 />
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 leading-none mb-1 flex items-center gap-2">
                 <Calendar size={10} /> {dict.finance.modals.debtPayment.date}
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer"
              />
           </div>

           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-600">{dict.finance.modals.debtPayment.autoTxn}</span>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setAutoTransaction(!autoTransaction)}
                   className={cn(
                     "w-10 h-5 rounded-full p-1 transition-all",
                     autoTransaction ? "bg-zinc-900" : "bg-slate-200"
                   )}
                 >
                   <div className={cn("w-3 h-3 bg-white rounded-full transition-all", autoTransaction && "translate-x-5")} />
                 </button>
              </div>
              <div className="flex gap-2 text-[9px] text-slate-400 leading-relaxed italic">
                 <AlertCircle size={12} className="shrink-0 mt-0.5" />
                 {dict.finance.modals.debtPayment.autoTxnDesc}
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-zinc-900 transition-all active:scale-95"
              >
                {dict.finance.modals.common.cancel}
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[1.5] h-12 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={14} /> Konfirmasi Bayar</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
