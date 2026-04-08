"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, TrendingUp, BarChart3, Calendar, Globe, Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrency } from "@/lib/finance-utils";
import { Investment, InvestmentType } from "@/lib/finance-types";

interface InvestmentModalProps {
  onClose: () => void;
  onSave: (data: Omit<Investment, "id">) => Promise<void>;
  initialData?: Investment;
  dict: any;
}

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'reksa_dana', label: 'Reksa Dana' },
  { value: 'saham', label: 'Saham' },
  { value: 'obligasi', label: 'Obligasi' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function InvestmentModal({ onClose, onSave, initialData, dict }: InvestmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<InvestmentType>(initialData?.type || 'reksa_dana');
  const [initialAmountStr, setInitialAmountStr] = useState(initialData ? formatCurrencyInput(initialData.initialAmount) : "");
  const [currentValueStr, setCurrentValueStr] = useState(initialData ? formatCurrencyInput(initialData.currentValue) : "");
  const [buyDate, setBuyDate] = useState(initialData?.buyDate ? initialData.buyDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [symbol, setSymbol] = useState(initialData?.symbol || "");
  const [lots, setLots] = useState(initialData?.lots?.toString() || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialAmountStr || !currentValueStr || !buyDate) return;

    setLoading(true);
    try {
      await onSave({
        name,
        type,
        initialAmount: parseCurrency(initialAmountStr),
        currentValue: parseCurrency(currentValueStr),
        buyDate: new Date(buyDate).toISOString(),
        symbol: symbol || undefined,
        lots: lots ? parseFloat(lots) : undefined,
        lastUpdated: new Date().toISOString()
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
                {initialData ? dict.finance.modals.investment.edit : dict.finance.modals.investment.add}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dict.finance.modals.investment.desc}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90">
              <X size={18} className="text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           {/* Investment Name */}
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.modals.investment.name}</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={dict.finance.modals.investment.namePlaceholder} 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all"
              />
           </div>

           {/* Type & Buy Date */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.modals.investment.instrument}</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as InvestmentType)}
                  required
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer"
                >
                  {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                   <Calendar size={10} /> {dict.finance.modals.investment.date}
                </label>
                <input 
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer"
                />
              </div>
           </div>

           {/* Optional Symbol & Lots for Stocks/Crypto */}
           {(type === 'saham' || type === 'crypto') && (
             <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                     <Globe size={10} /> {dict.finance.modals.investment.symbol}
                  </label>
                  <input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder={dict.finance.modals.investment.symbolPlaceholder} 
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                     <Layers size={10} /> {dict.finance.modals.investment.lots}
                  </label>
                  <input 
                    type="number"
                    step="any"
                    value={lots}
                    onChange={(e) => setLots(e.target.value)}
                    placeholder="0" 
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all"
                  />
                </div>
             </div>
           )}

           {/* Initial & Current Value */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.modals.investment.capital}</label>
                <input 
                  value={initialAmountStr}
                  onChange={(e) => setInitialAmountStr(formatCurrencyInput(e.target.value))}
                  required
                  placeholder="0" 
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2 text-emerald-600">
                  <BarChart3 size={10} /> {dict.finance.modals.investment.current}
                </label>
                <input 
                  value={currentValueStr}
                  onChange={(e) => setCurrentValueStr(formatCurrencyInput(e.target.value))}
                  required
                  placeholder="0" 
                  className="w-full h-11 px-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-black text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-200 transition-all placeholder:text-slate-300"
                />
              </div>
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
                className="flex-[1.5] h-12 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Simpan Investasi</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
