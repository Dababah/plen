"use client";

import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function GoogleCalendarSuccessPage() {
  useEffect(() => {
    // Notify the parent window that authentication was successful
    if (window.opener) {
      window.opener.postMessage("google-calendar-success", window.location.origin);
      
      // Auto-close the popup after a brief delay to show the success message
      const timer = setTimeout(() => {
        window.close();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50 border border-emerald-100">
        <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2.5} />
      </div>
      <h1 className="text-xl font-black text-zinc-900 uppercase tracking-widest mb-2">Connected!</h1>
      <p className="text-sm text-slate-500 font-bold max-w-xs leading-relaxed">
        Google Calendar has been successfully linked. This window will close automatically.
      </p>
      
      <div className="mt-8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
