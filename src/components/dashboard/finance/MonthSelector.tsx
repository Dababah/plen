"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export default function MonthSelector({ selectedDate, onChange }: MonthSelectorProps) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const prevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    onChange(d);
  };

  const nextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    onChange(d);
  };

  const isCurrentMonth = new Date().getMonth() === selectedDate.getMonth() && 
                        new Date().getFullYear() === selectedDate.getFullYear();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
        <button 
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-zinc-900 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        
        <div className="px-3 flex items-center gap-2 min-w-[120px] justify-center">
          <Calendar size={12} className="text-slate-300" />
          <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">
            {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
        </div>

        <button 
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-zinc-900 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {!isCurrentMonth && (
        <button 
          onClick={() => onChange(new Date())}
          className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95"
        >
          Bulan Ini
        </button>
      )}
    </div>
  );
}
