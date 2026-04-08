"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Flag, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  MoreVertical 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  category?: string | null;
  dueDate?: Date | null;
}

interface TaskListProps {
  initialTasks: Task[];
  dict: any;
  lang: string;
}

const TaskList = ({ initialTasks, dict, lang }: TaskListProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateTaskStatus(id, newStatus as any);
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    setTaskToDeleteId(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDeleteId) {
      try {
        await deleteTask(taskToDeleteId);
        setTasks(tasks.filter(t => t.id !== taskToDeleteId));
      } catch (error) {
        console.error(error);
      } finally {
        setTaskToDeleteId(null);
      }
    }
  };

  const filteredTasks = tasks.filter(t => filter === "all" || t.status === filter);

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56 lg:w-64 group">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-zinc-900 transition-colors" />
             <input 
               type="text" 
               placeholder={dict.tasks.searchPlaceholder} 
               className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-medium placeholder:text-slate-300"
             />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 pr-8 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all appearance-none cursor-pointer text-slate-600"
            >
              <option value="all">{dict.tasks.filterAll}</option>
              <option value="todo">{dict.tasks.status.todo}</option>
              <option value="in_progress">{dict.tasks.status.in_progress}</option>
              <option value="done">{dict.tasks.status.done}</option>
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 gap-2">
        {filteredTasks.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-2.5 bg-white rounded-xl border border-slate-100 border-dashed">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                <CheckCircle2 size={20} />
             </div>
             <p className="text-slate-400 font-medium text-xs">{dict.tasks.empty}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="p-3 rounded-xl bg-white border border-slate-100 hover:border-zinc-300 transition-all duration-200 group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1 flex-1 pr-3">
                   <div className="flex items-start sm:items-center gap-2.5">
                     <button 
                       onClick={() => handleStatusUpdate(task.id, task.status === 'done' ? 'todo' : 'done')}
                       className={cn(
                        "mt-0.5 sm:mt-0 w-4.5 h-4.5 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                        task.status === 'done' ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-zinc-700"
                       )}
                     >
                       {task.status === 'done' && <CheckCircle2 size={10} strokeWidth={3} />}
                     </button>
                     <h3 className={cn("text-xs md:text-sm font-semibold text-zinc-900", task.status === 'done' && "line-through text-slate-300")}>
                       {task.title}
                     </h3>
                   </div>
                   {task.description && (
                     <p className="text-[11px] text-slate-400 font-normal pl-7 leading-relaxed line-clamp-1">{task.description}</p>
                   )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                   <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border",
                    task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" : 
                    task.priority === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                   )}>
                     {task.priority === 'high' ? dict.tasks.priority.high : 
                      task.priority === 'medium' ? dict.tasks.priority.medium : 
                      dict.tasks.priority.low}
                   </div>
                   <button 
                     onClick={() => handleDelete(task.id)}
                     className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-7">
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                    <Calendar size={10} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                {task.category && (
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                    <Tag size={10} />
                    {task.category}
                  </div>
                )}
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-medium",
                  task.status === 'done' ? "text-green-500" : 
                  task.status === 'in_progress' ? "text-blue-500" : 
                  "text-slate-300"
                )}>
                  <Clock size={10} />
                  {task.status === 'done' ? dict.tasks.status.done : 
                   task.status === 'in_progress' ? dict.tasks.status.in_progress : 
                   dict.tasks.status.todo}
                </div>
              </div>
              
              {/* Subtle accent bar */}
              <div className={cn(
                "absolute bottom-0 left-0 h-0.5 transition-all duration-500",
                task.status === 'done' ? "w-full bg-green-500" : "w-0 bg-zinc-100 group-hover:w-6"
              )} />
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={dict.tasks.deleteModalTitle || (lang === 'id' ? "Hapus Tugas" : "Delete Task")}
        message={dict.tasks.deleteConfirm || (lang === 'id' ? "Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to delete this task? This action cannot be undone.")}
        variant="danger"
      />
    </div>
  );
};

export default TaskList;
