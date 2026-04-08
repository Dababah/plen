"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  MoreVertical,
  Loader2
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/events";
import EventModal from "./EventModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface CalendarViewProps {
  lang: string;
  dict: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CalendarView = ({ lang, dict }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialModalDate, setInitialModalDate] = useState<Date | undefined>();
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const { data: events, mutate, isLoading } = useSWR<CalendarEvent[]>("/api/events", fetcher);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: startDay }, (_, i) => i);

  const monthName = currentDate.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long' });

  const handleSaveEvent = async (eventData: any) => {
    try {
      const isEdit = !!eventData.id;
      const url = isEdit ? `/api/events/${eventData.id}` : "/api/events";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify(isEdit ? eventData : { ...eventData, syncToTasks: eventData.syncToTasks }),
      });

      if (res.ok) {
        mutate();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEventToDeleteId(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDeleteId) return;
    try {
      const res = await fetch(`/api/events/${eventToDeleteId}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEventToDeleteId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Calendar Header - Google Style Refined */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-slate-100 gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
              <CalendarIcon size={20} />
            </div>
            
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100/50">
              <button 
                onClick={prevMonth} 
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-zinc-900 shadow-sm border border-transparent hover:border-slate-100"
              >
                <ChevronLeft size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={nextMonth} 
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-zinc-900 shadow-sm border border-transparent hover:border-slate-100"
              >
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{monthName}</h2>
            <span className="text-base font-bold text-slate-300">{year}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedEvent(null); setInitialModalDate(new Date()); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid - Flexible Height */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-[320px]">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-50 bg-zinc-50/50 shrink-0">
          {[
            dict.calendar.days.sun,
            dict.calendar.days.mon,
            dict.calendar.days.tue,
            dict.calendar.days.wed,
            dict.calendar.days.thu,
            dict.calendar.days.fri,
            dict.calendar.days.sat
          ].map((day) => (
            <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </div>
          ))}
        </div>

        {/* Days Cells - Distributed Height */}
        <div 
          className="flex-1 grid grid-cols-7"
          style={{ 
            gridTemplateRows: `repeat(${Math.ceil((paddingDays.length + days.length) / 7)}, 1fr)` 
          }}
        >
          {paddingDays.map((p) => (
            <div key={`p-${p}`} className="p-1.5 md:p-2 border-r border-b border-slate-50 bg-slate-50/10 last:border-r-0" />
          ))}
          {days.map((day) => {
            const dateObj = new Date(year, month, day);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const dayEvents = events?.filter(e => new Date(e.start).toDateString() === dateObj.toDateString());

            return (
              <div 
                key={day} 
                onClick={() => {
                  setSelectedEvent(null);
                  setInitialModalDate(dateObj);
                  setIsModalOpen(true);
                }}
                className={cn(
                  "p-1.5 md:p-2 border-r border-b border-slate-50 hover:bg-zinc-50/50 transition-all duration-300 relative group cursor-pointer flex flex-col min-h-0 min-w-0",
                  isToday && "bg-zinc-50/20",
                  (paddingDays.length + day) % 7 === 0 && "border-r-0"
                )}
              >
                <div className="flex justify-start mb-1">
                  <span className={cn(
                    "text-[10px] md:text-xs font-black transition-all flex items-center justify-center w-6 h-6 rounded-lg",
                    isToday ? "text-white bg-zinc-900 shadow-lg shadow-zinc-900/20" : "text-slate-400 group-hover:text-zinc-900"
                  )}>
                    {day}
                  </span>
                </div>

                <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayEvents?.map(event => {
                      const label = event.color || event.category;
                      return (
                        <div 
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          className={cn(
                            "px-1.5 py-1 rounded-lg text-[8px] md:text-[9px] font-black truncate border transition-all hover:scale-[1.03] active:scale-95 shadow-sm uppercase tracking-tight",
                            label === 'task' || label === 'work' ? "bg-zinc-900 text-white border-zinc-900 shadow-zinc-900/10" :
                            label === 'personal' ? "bg-blue-500 text-white border-blue-500 shadow-blue-500/10" :
                            label === 'study' ? "bg-indigo-500 text-white border-indigo-500 shadow-indigo-500/10" :
                            label === 'health' ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/10" :
                            label === 'travel' ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/10" :
                            label === 'finance' ? "bg-amber-500 text-white border-amber-500 shadow-amber-500/10" :
                            label === 'other' ? "bg-slate-400 text-white border-slate-400 shadow-slate-400/10" :
                            "bg-white text-zinc-900 border-slate-200"
                          )}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={lang === 'id' ? "Hapus Acara" : "Delete Event"}
        message={lang === 'id' ? "Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to delete this event? This action cannot be undone."}
        variant="danger"
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        initialDate={initialModalDate}
        dict={dict}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99]">
          <Loader2 className="animate-spin text-zinc-900" size={32} />
        </div>
      )}
    </div>
  );
};

export default CalendarView;
