import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import { 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const session = await auth();

  if (!session) {
    redirect(`/${lang}/login`);
  }

  const user = session.user;
  const dict = await getDictionary(lang);

  // Mock stats
  const stats = {
    tasksToday: 0,
    upcomingEvents: 0,
    goalsActive: 0,
    overallProgress: 0
  };

  return (
    <div className="w-full animate-in fade-in zoom-in duration-700 h-full overflow-hidden">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-0.5 leading-none">
            {dict.dashboard.title}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            {dict.dashboard.welcome.replace('{name}', user?.name?.split(' ')[0] || 'User')}
          </p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[10px] font-bold text-zinc-900 leading-none mb-1">
             {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
           <p className="text-[9px] text-slate-400 font-medium">{dict.dashboard.status}</p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Today's Focus Card */}
          <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-100 shadow-sm space-y-4 md:space-y-6 hover:border-zinc-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-base md:text-lg font-bold text-zinc-900">{dict.dashboard.focus}</h2>
                <p className="text-[11px] text-slate-400 font-normal">
                  {dict.dashboard.tasksPending.replace('{count}', stats.tasksToday.toString())}
                </p>
              </div>
              <Link href={`/${lang}/tasks`} className="w-8 h-8 rounded-lg bg-zinc-50 border border-slate-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Task Quick List Placeholder */}
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-2 py-8">
              <CheckCircle2 size={20} className="text-slate-300" />
              <p className="text-[11px] font-semibold text-slate-400">{dict.dashboard.noTasks}</p>
              <Link href={`/${lang}/tasks`} className="text-[10px] font-bold text-zinc-900 hover:underline">{dict.dashboard.addTask}</Link>
            </div>
          </div>

          {/* Additional cards grouping or expanded charts would go here */}
        </div>

        {/* Side Column */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Upcoming Event Snippet */}
          <div className="p-5 md:p-6 rounded-xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400">{dict.dashboard.upcoming}</p>
              <CalendarIcon size={14} className="text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-900">{dict.dashboard.schedule}</p>
              <p className="text-[10px] text-slate-400 font-medium">{dict.dashboard.noEvents}</p>
            </div>
            <Link href={`/${lang}/calendar`} className="block w-full py-2.5 text-center rounded-lg bg-zinc-900 text-white text-[10px] font-semibold shadow-md hover:bg-zinc-800 transition-colors">
              Open calendar
            </Link>
          </div>

          {/* Progress Tracker */}
          <div className="p-5 md:p-6 rounded-xl bg-zinc-900 text-white shadow-md space-y-4">
             <div className="flex items-center justify-between">
              <TrendingUp size={16} className="text-zinc-500" />
              <p className="text-[10px] font-semibold text-zinc-500">{dict.dashboard.goalProgress}</p>
            </div>
            <div className="space-y-3">
               <div className="flex items-end justify-between leading-none">
                  <p className="text-2xl font-bold tracking-tight">{stats.overallProgress}%</p>
                  <p className="text-[9px] text-zinc-500 font-medium">{dict.dashboard.overallCompletion}</p>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.overallProgress}%` }} 
                  />
               </div>
            </div>
            <Link href={`/${lang}/goals`} className="flex items-center justify-center gap-2 text-[9px] font-semibold text-zinc-500 hover:text-white transition-colors">
              {dict.dashboard.viewMilestones} <MoreHorizontal size={10} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
