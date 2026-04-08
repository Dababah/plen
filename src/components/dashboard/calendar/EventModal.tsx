"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  AlignLeft,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  MoreVertical,
  ChevronDown,
  Loader2,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/events";
import { format } from "date-fns";

interface EventModalProps {
  event?: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  initialDate?: Date;
  dict: any;
}

const CATEGORIES = [
  { id: 'work', label: 'Work', color: 'bg-zinc-900', ring: 'ring-zinc-900/20' },
  { id: 'personal', label: 'Personal', color: 'bg-blue-500', ring: 'ring-blue-500/20' },
  { id: 'study', label: 'Study', color: 'bg-indigo-500', ring: 'ring-indigo-500/20' },
  { id: 'health', label: 'Health', color: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  { id: 'travel', label: 'Travel', color: 'bg-orange-500', ring: 'ring-orange-500/20' },
  { id: 'finance', label: 'Finance', color: 'bg-amber-500', ring: 'ring-amber-500/20' },
  { id: 'other', label: 'Other', color: 'bg-slate-400', ring: 'ring-slate-400/20' },
];

const EventModal = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  dict
}: EventModalProps) => {
  const [activeTab, setActiveTab] = useState<'event' | 'task'>('event');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isEditing, setIsEditing] = useState(!event);
  const [menuOpen, setMenuOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState("work");
  const [syncToTasks, setSyncToTasks] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDateForInput = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (isOpen) {
      setShowMore(false);
      setMenuOpen(false);
      setIsEditing(!event);
      
      if (event) {
        setTitle(event.title);
        setDescription(event.description || "");
        setCategory(event.color || "work"); // Label stored in color field
        
        // Type stored in category field
        const type = event.category === 'task' ? 'task' : 'event';
        setActiveTab(type);
        
        const start = new Date(event.start);
        const end = new Date(event.end);
        setStartDate(formatDateForInput(start));
        setStartTime(start.toTimeString().slice(0, 5));
        setEndDate(formatDateForInput(end));
        setEndTime(end.toTimeString().slice(0, 5));
        setSyncToTasks(false);
      } else {
        setTitle("");
        setDescription("");
        const date = initialDate || new Date();
        const dateStr = formatDateForInput(date);
        setStartDate(dateStr);
        setEndDate(dateStr);
        setStartTime("09:00");
        setEndTime("10:00");
        setCategory("work");
        setActiveTab('event');
        setSyncToTasks(false);
      }
    }
  }, [event, isOpen, initialDate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      await onSave({
        id: event?.id,
        title,
        description,
        start: startDateTime,
        end: endDateTime,
        category: activeTab, // 'event' or 'task'
        color: category,     // 'work', 'personal', etc.
        syncToTasks: activeTab === 'task' ? syncToTasks : false,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-white/40 backdrop-blur-2xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="w-full max-w-[380px] bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative z-50">
        <div className="px-4 pt-4 pb-1 flex items-center justify-between relative">
          <div className="flex items-center gap-1">
            <div className="p-2 text-slate-400">
              <CalendarIcon size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {event?.id && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-zinc-900 rounded-full transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (onDelete && event.id) onDelete(event.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-zinc-900 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {!isEditing && event ? (
          <div className="p-5 pt-0 space-y-6">
            <div className="px-1">
              <h3 className="text-xl font-semibold text-zinc-900 leading-tight">
                {event.title}
              </h3>
            </div>

            <div className="space-y-4 px-1 text-slate-600">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-sm",
                  CATEGORIES.find(c => c.id === (event.color || event.category))?.color || "bg-zinc-900"
                )} />
                <span className="text-xs font-medium capitalize tracking-wide">
                  {CATEGORIES.find(c => c.id === (event.color || event.category))?.label || (event.color || event.category)}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-zinc-900">
                    {(() => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      const isSameDay = start.toDateString() === end.toDateString();
                      
                      const dateOptions: Intl.DateTimeFormatOptions = {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      };

                      if (isSameDay) {
                        return start.toLocaleDateString(dict.lang === 'id' ? 'id-ID' : 'en-US', dateOptions);
                      } else {
                        return `${start.toLocaleDateString(dict.lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(dict.lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                      }
                    })()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" – "}
                    {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {event.description && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-50">
                  <AlignLeft className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
              <div className="px-1">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full text-lg font-semibold text-zinc-900 placeholder:text-slate-300 focus:outline-none border-b-2 border-transparent focus:border-zinc-900 transition-all pb-1"
                />
              </div>

              <div className="flex items-center gap-1 px-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('event')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeTab === 'event' ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10" : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  Event
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('task')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeTab === 'task' ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10" : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  Task
                </button>
              </div>

              <div className="space-y-4 px-1">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-2 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-zinc-900 focus:outline-none hover:bg-slate-50 p-1 rounded-md transition-colors"
                      />
                      <span className="text-slate-200">–</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-zinc-900 focus:outline-none hover:bg-slate-50 p-1 rounded-md transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 w-fit p-1 rounded-lg">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-white border border-slate-100 shadow-sm text-[10px] font-semibold px-2 py-1 rounded-md focus:outline-none"
                      />
                      <span className="text-[8px] font-bold text-slate-300">TO</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-white border border-slate-100 shadow-sm text-[10px] font-semibold px-2 py-1 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full shrink-0 shadow-sm",
                      CATEGORIES.find(c => c.id === category)?.color || "bg-zinc-900"
                    )}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all ring-offset-2 hover:scale-125 active:scale-95",
                          cat.color,
                          category === cat.id ? "ring-2 " + cat.ring : "opacity-60 hover:opacity-100"
                        )}
                        title={cat.label}
                      />
                    ))}
                  </div>
                </div>

                {activeTab === 'task' && (
                  <div className="flex items-center gap-3 group bg-indigo-50/30 p-2 rounded-xl border border-indigo-100/50">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={syncToTasks}
                          onChange={(e) => setSyncToTasks(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-8 h-5 rounded-full transition-colors duration-300",
                          syncToTasks ? "bg-zinc-900" : "bg-slate-200"
                        )} />
                        <div className={cn(
                          "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                          syncToTasks ? "translate-x-3" : "translate-x-0"
                        )} />
                      </div>
                      <div>
                        <span className="text-[9px] font-semibold text-zinc-900">Sync to Kanban</span>
                      </div>
                    </label>
                  </div>
                )}

                {showMore && (
                  <div className="animate-in slide-in-from-top-2 duration-300 space-y-3 pt-2 border-t border-slate-50">
                    <div className="flex items-start gap-4">
                      <AlignLeft className="w-4 h-4 text-slate-400 mt-2 shrink-0" />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add description"
                        rows={2}
                        className="w-full text-[11px] font-medium text-zinc-900 placeholder:text-slate-300 focus:outline-none hover:bg-slate-50/50 p-2 rounded-lg transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>

            <div className="p-3 px-5 border-t border-slate-50 flex items-center justify-between bg-zinc-50/10">
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="text-[9px] font-semibold text-slate-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
              >
                {showMore ? "Less options" : "More options"}
                <ChevronDown size={10} className={cn("transition-transform", showMore && "rotate-180")} />
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={loading || !title}
                className="min-w-[80px] h-9 bg-zinc-900 text-white rounded-xl text-[10px] font-semibold shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-3 h-3" /> : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EventModal;
