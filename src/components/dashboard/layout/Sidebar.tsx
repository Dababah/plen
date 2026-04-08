"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  CheckSquare,
  Calendar,
  Target,
  Activity,
  StickyNote,
  BookOpen,
  Wallet,
  Users,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  lang: string;
  user: any;
  dict: any;
}

const Sidebar = ({ lang, user, dict }: SidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    {
      title: dict.navbar?.dashboard || "Dashboard",
      href: `/${lang}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: dict.navbar?.tasks || "Task Manager",
      href: `/${lang}/tasks`,
      icon: CheckSquare,
    },
    {
      title: dict.navbar?.calendar || "Calendar",
      href: `/${lang}/calendar`,
      icon: Calendar,
    },
    {
      title: dict.navbar?.goals || "Goals",
      href: `/${lang}/goals`,
      icon: Target,
    },
    {
      title: dict.navbar?.habits || "Habit Tracker",
      href: `/${lang}/habits`,
      icon: Activity,
    },
    {
      title: dict.navbar?.notes || "Notes",
      href: `/${lang}/notes`,
      icon: StickyNote,
    },
    {
      title: dict.navbar?.journal || "Journal",
      href: `/${lang}/journal`,
      icon: BookOpen,
    },
    {
      title: dict.navbar?.finance || "Finance",
      href: `/${lang}/finance`,
      icon: Wallet,
    },
    {
      title: dict.navbar?.network || "Network",
      href: `/${lang}/network`,
      icon: Users,
    },
  ];

  return (
    <aside className="w-full flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100/80 shadow-sm p-3.5 md:p-4 flex flex-col justify-between overflow-hidden pointer-events-auto relative">
      <div className="space-y-5 md:space-y-6 relative z-10">
        {/* Branding Header */}
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-8 h-8 relative rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-100/50">
            <Image src="/logo_app.png" alt="Plen Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight">Plen</h1>
        </div>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all",
                  isActive
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-200/40"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-slate-50"
                )}
              >
                <item.icon size={14} strokeWidth={2} className={cn(isActive ? "" : "group-hover:scale-110 transition-transform")} />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile + Logout */}
      <div className="mt-4 md:mt-6 space-y-1.5 relative z-10">
        <Link
          href={`/${lang}/settings`}
          className="group flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 border border-slate-100 hover:border-zinc-300 hover:bg-white transition-all shadow-sm"
        >
          <div 
            className="w-8 h-8 rounded-full bg-blue-600 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 text-white relative"
            style={{ borderRadius: '50%' }}
          >
            {user?.image ? (
              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={16} strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] md:text-xs font-semibold text-zinc-900 truncate leading-none">{user?.name || "User"}</p>
            <p className="text-[9px] md:text-[10px] text-emerald-500 font-medium mt-0.5">{dict.dashboard.online}</p>
          </div>
          <div className="w-5 h-5 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-zinc-700 group-hover:border-zinc-300 transition-all">
            <Settings size={10} className="group-hover:rotate-90 transition-transform duration-500" />
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: `/${lang}/login` })}
          suppressHydrationWarning
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-[11px] md:text-xs font-semibold transition-all"
        >
          <LogOut size={14} />
          {dict.navbar.logout}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
