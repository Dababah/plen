"use client";

import React, { useState } from "react";
import InteractiveGrid from "@/components/InteractiveGrid";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import { Menu, X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import HubSidebar from "@/components/dashboard/layout/HubSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  lang: string;
  dict: any;
  session: any;
}

export default function DashboardShell({
  children,
  lang,
  dict,
  session,
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Use real account data including scopes
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const fetchAccounts = React.useCallback(async () => {
    if (session?.user?.id) {
       try {
        const res = await fetch('/api/user/accounts');
        const data = await res.json();
        if (data.success) {
          setAccounts(data.accounts);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    }
  }, [session?.user?.id]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Listen for popup messages
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data === "google-calendar-success") {
        fetchAccounts();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchAccounts]);

  const isGoogleConnected = accounts.some(acc => 
    acc.provider === "google" && 
    acc.scope?.includes("https://www.googleapis.com/auth/calendar.events")
  );

  return (
    <div className="h-screen w-full flex bg-transparent relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fdfdfd]/50 backdrop-blur-[2px]">
        <div className="absolute inset-0 z-0 opacity-100">
          <InteractiveGrid />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,240,240,0.4),transparent)]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm z-40 md:hidden transition-all duration-300 pointer-events-auto"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] md:w-[240px] lg:w-[260px] p-3 md:p-4 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0 md:flex flex-col items-start h-screen shrink-0",
        isMobileMenuOpen ? "translate-x-0 transition-opacity opacity-100" : "-translate-x-full"
      )}>
        <Sidebar lang={lang} user={session?.user} dict={dict} />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 relative z-10 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-[#fdfdfd]/40 backdrop-blur-md border-b border-slate-100/30 p-3 flex items-center justify-end z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-100/50 shadow-sm active:scale-95 transition-all text-zinc-900"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </header>

        {/* Main Content - scrollable */}
        <main className="flex-1 w-full pt-4 md:pt-6 pb-24 px-4 md:px-6 lg:px-8 overflow-y-auto scrollbar-hide relative">
          <div className="w-full mx-auto lg:max-w-[1024px] min-[1200px]:max-w-[1200px] min-[1920px]:max-w-[1920px] pointer-events-auto relative z-20">
            {children}
          </div>

          {/* Right Sidebar Toggle Button */}
          {!isRightSidebarOpen && (
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              suppressHydrationWarning
              className="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 py-5 bg-zinc-900 backdrop-blur-md border-l border-t border-b border-zinc-800 rounded-l-2xl shadow-2xl text-white hover:bg-zinc-800 transition-all group scale-x-75 hover:scale-x-100 origin-right border-zinc-700"
              aria-label="Open Calendar Sidebar"
            >
              <ChevronLeft size={14} className="group-hover:scale-125 transition-transform" strokeWidth={3} />
            </button>
          )}

          <footer className="mt-16 opacity-10 pointer-events-none h-8 flex items-center justify-center md:justify-start">
            <p className="text-[7px] font-semibold text-slate-300">
              © 2026
            </p>
          </footer>
        </main>
      </div>

      {/* Right Sidebar Component */}
      <HubSidebar 
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        lang={lang}
        dict={dict}
        isConnected={isGoogleConnected}
      />
    </div>
  );
}
