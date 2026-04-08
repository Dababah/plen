"use client";

import React, { useState, useEffect } from "react";
import type { Locale } from "@/i18n-config";
import JournalView from "@/components/dashboard/journal/JournalView";
import { getDictionary } from "@/lib/get-dictionary";

export default function JournalPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const [lang, setLang] = useState<Locale>("id");
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    params.then(async (p) => {
      setLang(p.lang);
      const d = await getDictionary(p.lang);
      setDict(d);
    });
  }, [params]);

  if (!dict) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-0.5 leading-none">
          {dict.journal.title}
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">{dict.journal.desc}</p>
      </div>

      <JournalView initialEntries={[]} lang={lang} dict={dict} />
    </div>
  );
}
