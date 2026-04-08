"use client";

import React, { useState } from "react";
import { X, Save, Calendar, Tag, Flag, Loader2 } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onClose: () => void;
  lang: string;
  dict: any;
}

const TaskForm = ({ onClose, lang, dict }: TaskFormProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createTask(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-bold text-zinc-900 leading-tight">{dict.modals.task.add}</h2>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-normal">{dict.modals.task.desc}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
              <X size={18} className="text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 md:space-y-6">
           {/* Task Title */}
           <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 pl-0.5">{dict.modals.task.title}</label>
              <input 
                name="title"
                required
                placeholder={dict.modals.task.titlePlaceholder} 
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-all shadow-sm"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-700 pl-0.5 flex items-center gap-1.5">
                  <Flag size={10} strokeWidth={2.5}/> {dict.modals.task.priority}
                </label>
                <select 
                  name="priority"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-700 pl-0.5 flex items-center gap-1.5">
                  <Calendar size={10} strokeWidth={2.5}/> {dict.modals.task.deadline}
                </label>
                <input 
                  type="date"
                  name="dueDate"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all cursor-pointer shadow-sm"
                />
              </div>
           </div>

           {/* Category */}
           <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 pl-0.5 flex items-center gap-1.5">
                <Tag size={10} strokeWidth={2.5}/> {dict.modals.task.category}
              </label>
              <input 
                type="text"
                name="category"
                placeholder="e.g. Work, Personal, Side project"
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all shadow-sm"
              />
           </div>

           {/* Description */}
           <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 pl-0.5">{dict.modals.task.description}</label>
              <textarea 
                name="description"
                rows={3}
                placeholder={dict.modals.task.descriptionPlaceholder} 
                className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-all resize-none shadow-sm"
              />
           </div>

           <div className="pt-2 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-slate-50 rounded-lg transition-all"
              >
                {dict.modals.common.cancel}
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Create task</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
