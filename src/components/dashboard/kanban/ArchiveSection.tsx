"use client";

import React, { useState } from "react";
import { 
  Archive, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Trash2, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Task } from "@/types/tasks";

interface ArchiveSectionProps {
  tasks: Task[];
  dict: any;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const ArchiveSection = ({ 
  tasks, 
  dict, 
  onRestore, 
  onDelete, 
  onClear 
}: ArchiveSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="mt-12 mb-8 animate-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-zinc-200 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200/50 flex items-center justify-center text-slate-500">
            <Archive size={16} />
          </div>
          <div className="text-left">
            <h2 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.tasks.archive.title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{tasks.length} {dict.navbar.tasks}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isExpanded && (
             <button 
               onClick={(e) => { e.stopPropagation(); onClear(); }}
               className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tighter"
             >
               {dict.tasks.archive.clearAll}
             </button>
           )}
           <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:text-zinc-900 transition-all shadow-sm">
             {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
           </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 border-dashed animate-in fade-in zoom-in-95 duration-300">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-zinc-300 transition-all group/item"
            >
              <div className="flex items-center gap-4 flex-1">
                 <div className={cn(
                   "w-1 h-8 rounded-full",
                   task.priority === 'high' ? "bg-red-500" : 
                   task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                 )} />
                 <div>
                   <h3 className="text-xs font-bold text-slate-600 line-clamp-1">{task.title}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 uppercase letter-spacing-tight">
                        <Calendar size={10} />
                        {task.archivedAt ? format(new Date(task.archivedAt), 'dd MMM yyyy') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase letter-spacing-tight tracking-tighter">
                        <AlertCircle size={10} />
                        {task.archivedReason ? (dict.tasks.archive.reason[task.archivedReason] || task.archivedReason) : dict.tasks.archive.reason.manual}
                      </div>
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                <button 
                  onClick={() => onRestore(task.id!)}
                  title={dict.tasks.archive.restore}
                  className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => onDelete(task.id!)}
                  title={dict.tasks.archive.deletePermanent}
                  className="p-2 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{dict.tasks.archive.empty}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchiveSection;
 

