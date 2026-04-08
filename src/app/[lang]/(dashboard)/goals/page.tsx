"use client";

import React, { useState, useEffect } from "react";
import type { Locale } from "@/i18n-config";
import GoalsView from "@/components/dashboard/goals/GoalsView";
import { getDictionary } from "@/lib/get-dictionary";
import { Loader2 } from "lucide-react";

export default function GoalsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const [lang, setLang] = useState<Locale>("id");
  const [dict, setDict] = useState<Record<string, any> | null>(null);
  const [goals, setGoals] = useState<any[] | null>(null);

  useEffect(() => {
    params.then(async (p) => {
      setLang(p.lang);
      const d = await getDictionary(p.lang);
      setDict(d);
    });
  }, [params]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/goals");
        if (res.ok) {
          const data = await res.json();
          setGoals(data);
        } else {
          setGoals([]);
        }
      } catch {
        setGoals([]);
      }
    };
    fetchGoals();
  }, []);

  if (!dict || goals === null) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-0.5 leading-none">
          {dict.goals.title}
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">{dict.navbar.goals}</p>
      </div>

      <GoalsView initialGoals={goals} lang={lang} dict={dict} />
    </div>
  );
}
