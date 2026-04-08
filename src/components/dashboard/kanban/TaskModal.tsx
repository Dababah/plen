"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  X,
  Save,
  Calendar,
  Tag,
  Flag,
  Loader2,
  Trash2,
  Plus,
  Layout,
  Check
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

import { Task } from "@/types/tasks";

interface TaskCategory {
  id: string;
  name: string;
}

interface TaskModalProps {
  task?: Task | null;
  initialStatus?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  dict: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TaskModal = ({
  task,
  initialStatus = "todo",
  isOpen,
  onClose,
  onSave,
  onDelete,
  dict
}: TaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  const { data: categories, mutate: mutateCategories } = useSWR<TaskCategory[]>("/api/tasks/categories", fetcher);

  const [formData, setFormData] = useState<Task>({
    title: "",
    description: "",
    priority: "medium",
    status: initialStatus,
    category: "Lainnya",
    dueDate: null,
    subtasks: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        subtasks: [], // Subtasks/Milestones removed as requested
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: initialStatus,
        category: "Lainnya",
        dueDate: null,
        subtasks: [],
      });
    }
  }, [task, initialStatus, isOpen]);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("/api/tasks/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const newCat = await res.json();
        mutateCategories();
        setFormData({ ...formData, category: newCat.name });
        setNewCatName("");
        setAddingCategory(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/tasks/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateCategories();
        if (formData.category === name) {
          setFormData({ ...formData, category: "Lainnya" });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...formData, subtasks: [] });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 leading-tight tracking-tight uppercase">
                {task ? dict.finance.modals.task.edit : dict.finance.modals.task.add}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                {dict.finance.modals.task.desc}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Section: Basic Info */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">TASK TITLE</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="What needs to be done?"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <Flag size={12} strokeWidth={3} /> PRIORITY
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none appearance-none cursor-pointer shadow-sm transition-all"
                >
                  <option value="low">{dict.tasks.priority.low}</option>
                  <option value="medium">{dict.tasks.priority.medium}</option>
                  <option value="high">{dict.tasks.priority.high}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <Calendar size={12} strokeWidth={3} /> DEADLINE
                </label>
                <input
                  type="date"
                  value={formData.dueDate ? format(new Date(formData.dueDate), 'yyyy-MM-dd') : ""}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none cursor-pointer shadow-sm transition-all text-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} strokeWidth={3} /> CATEGORY
                </label>
                <button
                  type="button"
                  onClick={() => setAddingCategory(!addingCategory)}
                  className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  {addingCategory ? "CANCEL" : <><Plus size={10} strokeWidth={4} /> ADD NEW</>}
                </button>
              </div>

              {addingCategory && (
                <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    autoFocus
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                    placeholder="Category name..."
                    className="flex-1 h-9 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-bold focus:outline-none focus:border-zinc-400 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="aspect-square h-9 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10"
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {/* Default Category */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: "Lainnya" })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider",
                    formData.category === "Lainnya"
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/10"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                  )}
                >
                  Lainnya
                </button>

                {/* Custom Categories */}
                {Array.isArray(categories) && categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider flex items-center gap-2 group",
                      formData.category === cat.name
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/10"
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                    )}
                  >
                    {cat.name}
                    <span 
                      onClick={(e) => handleDeleteCategory(e, cat.id, cat.name)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500 hover:text-white rounded-md transition-all",
                        formData.category === cat.name ? "group-hover:opacity-40" : ""
                      )}
                    >
                      <X size={10} strokeWidth={4} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">DESCRIPTION (OPTIONAL)</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Add more details about this task..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold placeholder:text-slate-300 focus:outline-none resize-none shadow-sm transition-all leading-relaxed"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-50 flex items-center justify-between gap-3">
          {onDelete && task?.id && (
            <button
              type="button"
              onClick={() => onDelete(task.id!)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <Trash2 size={20} />
            </button>
          )}
          <div className="flex-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 text-xs font-black text-slate-400 hover:text-zinc-900 transition-all uppercase tracking-widest border border-slate-100 rounded-xl bg-zinc-50/50 active:scale-[0.98]"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] h-11 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> SAVE</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TaskModal;


