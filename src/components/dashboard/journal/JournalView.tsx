"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  createdAt: Date;
}

interface JournalViewProps {
  initialEntries: JournalEntry[];
  lang: string;
  dict: any;
}

const JournalView = ({ initialEntries, lang, dict }: JournalViewProps) => {
  const [entries, setEntries] = useState(initialEntries);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const moods = [
    { name: dict.journal.moods.excellent, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: dict.journal.moods.great, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: dict.journal.moods.good, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: dict.journal.moods.neutral, icon: Meh, color: 'text-slate-500', bg: 'bg-slate-50' },
    { name: dict.journal.moods.low, icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header & Mood Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         <div className="lg:col-span-2 p-4 md:p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 md:space-y-6">
            <div className="space-y-1">
               <h2 className="text-base md:text-lg font-bold text-zinc-900 leading-tight">{dict.journal.title}</h2>
               <p className="text-[11px] md:text-xs text-slate-400 font-normal leading-relaxed">{dict.journal.desc}</p>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-medium text-slate-400">How are you feeling today?</p>
               <div className="grid grid-cols-5 gap-2">
                  {moods.map((mood) => (
                    <button 
                      key={mood.name}
                      onClick={() => setActiveMood(mood.name)}
                      className={cn(
                        "py-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border transition-all duration-200",
                        activeMood === mood.name 
                          ? `${mood.bg} border-zinc-900 ${mood.color} shadow-sm` 
                          : "bg-slate-50 border-slate-50 text-slate-300 hover:border-slate-200"
                      )}
                    >
                      <mood.icon size={16} />
                      <span className="text-[9px] font-semibold">{mood.name}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-medium text-slate-400">{dict.journal.reflection}</p>
               <textarea 
                 placeholder="Write about your thoughts..."
                 className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none min-h-[120px] md:min-h-[160px]"
               />
            </div>

            <button className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all">
              {dict.journal.saveBtn}
            </button>
         </div>

         {/* Side: History Snippet */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="p-4 md:p-5 bg-zinc-900 rounded-xl text-white space-y-4 shadow-md relative overflow-hidden group/card">
               <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none transition-transform group-hover/card:scale-110">
                  <Calendar size={48} strokeWidth={1} />
               </div>
               <div className="flex items-center justify-between opacity-50 relative z-10">
                  <Calendar size={14} />
                  <p className="text-[10px] font-semibold">{dict.journal.history}</p>
               </div>
               <div className="space-y-2 relative z-10">
                  <p className="text-sm md:text-base font-bold tracking-tight leading-none">Journal logs</p>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">You have recorded 0 entries in the last 7 days.</p>
               </div>
               <div className="pt-1 relative z-10">
                  <button className="w-full py-2 rounded-lg border border-zinc-700 text-[10px] font-semibold hover:bg-zinc-800 transition-all shadow-sm">
                    {dict.journal.viewArchive}
                  </button>
               </div>
            </div>

            {/* Empty State History */}
            <div className="p-4 md:p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3 py-6 md:py-8">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 shrink-0">
                  <BookOpen size={20} />
               </div>
               <p className="text-[10px] text-slate-400 font-semibold">{dict.journal.empty}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default JournalView;
