"use client";

import React, { useState, useEffect } from "react";
import type { Locale } from "@/i18n-config";
import CalendarView from "@/components/dashboard/calendar/CalendarView";
import { getDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CalendarPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const [lang, setLang] = useState<Locale>("id");
  const [dict, setDict] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    params.then(async (p) => {
      setLang(p.lang);
      const d = await getDictionary(p.lang);
      setDict(d);
    });
  }, [params]);

  if (!dict) return null;

  const isCalendar = !pathname.endsWith("/schedule");

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-0.5 leading-none">
            {dict.navbar.calendar}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight whitespace-nowrap">
            {dict.dashboard.calendarDesc}
          </p>
        </div>

        {/* Tab Switcher - URL Based */}
        <div className="bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-slate-100 flex items-center shadow-sm w-fit self-start md:self-auto">
          <Link
            href={`/${lang}/calendar`}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              isCalendar 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10" 
                : "text-slate-400 hover:text-zinc-600"
            )}
          >
            <CalendarIcon size={14} strokeWidth={2.5} />
            <span>CALENDAR</span>
          </Link>
          <Link
            href={`/${lang}/calendar/schedule`}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              !isCalendar 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10" 
                : "text-slate-400 hover:text-zinc-600"
            )}
          >
            <Clock size={14} strokeWidth={2.5} />
            <span>SCHEDULE</span>
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="transition-all duration-500 opacity-100 translate-y-0">
          <CalendarView lang={lang} dict={dict} />
        </div>
      </div>
    </div>
  );
}
