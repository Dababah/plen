"use client";

import React, { useState } from "react";
import { 
  Mail, 
  LogOut, 
  ChevronLeft,
  Calendar,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import AvatarPicker from "./AvatarPicker";
import { signOut } from "next-auth/react";

interface ProfileViewProps {
  user: any;
  dict: any;
  lang: string;
}

export default function ProfileView({ user: initialUser, dict, lang }: ProfileViewProps) {
  const [user, setUser] = useState(initialUser);

  const handleAvatarSelect = (newImageUrl: string) => {
    setUser({ ...user, image: newImageUrl });
  };

  return (
    <div className="w-full max-w-[600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.06)] p-8 md:p-12 space-y-10">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/${lang}/dashboard`}
            className="group inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-zinc-900 transition-all uppercase tracking-[0.2em]"
          >
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-zinc-900 transition-all">
              <ChevronLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            {lang === "id" ? "Kembali" : "Back"}
          </Link>
          <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">User Identity</span>
        </div>

        {/* Profile Info Section with Interactive Avatar */}
        <div className="flex flex-col items-center text-center space-y-6">
          <AvatarPicker 
            currentImage={user?.image} 
            onSelect={handleAvatarSelect}
            lang={lang}
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{user?.name || "User"}</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{user?.email}</p>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-5 group hover:bg-white hover:border-zinc-800 hover:shadow-xl hover:shadow-zinc-200/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-zinc-900 group-hover:text-white border border-slate-100 group-hover:border-transparent transition-all duration-500">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-1">Primary Email</p>
              <p className="text-base font-black text-zinc-900 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-5 group hover:bg-white hover:border-zinc-800 hover:shadow-xl hover:shadow-zinc-200/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-zinc-900 group-hover:text-white border border-slate-100 group-hover:border-transparent transition-all duration-500">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-1">Account Active Since</p>
              <p className="text-base font-black text-zinc-900">APRIL 2026</p>
            </div>
          </div>
        </div>

        {/* Security / Logout Area */}
        <div className="pt-6 space-y-6">
          <div className="h-px w-full bg-slate-100/60" />
          <button 
            onClick={() => signOut({ callbackUrl: `/${lang}/login` })}
            className="w-full h-14 flex items-center justify-center gap-3 bg-red-50 text-red-600 font-black rounded-[1.8rem] hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-2xl hover:shadow-red-200/50 group active:scale-[0.98]"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {lang === "id" ? "KELUAR SEKARANG" : "LOGOUT NOW"}
          </button>
          <div className="flex justify-center items-center gap-2 opacity-30">
            <ShieldAlert size={14} className="text-slate-400" />
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
              Encrypted Management Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
