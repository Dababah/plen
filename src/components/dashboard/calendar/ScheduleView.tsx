"use client";

import React, { useState } from "react";
import { 
  Plus, 
  FileUp, 
  Trash2, 
  Edit2, 
  Clock, 
  MapPin, 
  User as UserIcon,
  Loader2,
  CalendarDays
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Course } from "@/types/courses";

interface ScheduleViewProps {
  lang: string;
  dict: any;
}

import CourseModal from "./CourseModal";
import ImportModal from "../layout/ImportModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

const ScheduleView = ({ lang, dict }: ScheduleViewProps) => {
  const { data: courses, mutate, isLoading } = useSWR<Course[]>("/api/courses", fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [courseToDeleteId, setCourseToDeleteId] = useState<string | null>(null);

  const handleSave = async (courseData: Course) => {
    try {
      const isEdit = !!courseData.id;
      const url = isEdit ? `/api/courses/${courseData.id}` : "/api/courses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify(courseData),
      });

      if (res.ok) {
        mutate();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportSuccess = () => {
    mutate();
    setIsImportOpen(false);
  };

  const handleDelete = (id: string) => {
    setCourseToDeleteId(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDeleteId) {
      try {
        const res = await fetch(`/api/courses/${courseToDeleteId}`, { method: "DELETE" });
        if (res.ok) mutate();
      } catch (err) {
        console.error(err);
      } finally {
        setCourseToDeleteId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-slate-100 gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-black text-zinc-900 uppercase tracking-tight">University Schedule</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Manage your classes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-50/50 text-zinc-600 border border-slate-100 rounded-xl text-[10px] font-black shadow-sm hover:bg-white hover:text-zinc-900 hover:border-slate-200 active:scale-95 transition-all uppercase tracking-widest"
          >
            <FileUp size={14} strokeWidth={2.5} />
            <span>IMPORT</span>
          </button>
          <button 
            onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>ADD CLASS</span>
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:min-w-full">
        {/* Days Header */}
        <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-slate-100 bg-zinc-50/50">
          <div className="p-4 border-r border-slate-100" />
          {DAYS.map((day) => (
            <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{day}</span>
            </div>
          ))}
        </div>

        {/* Timetable Rows */}
        <div className="overflow-y-auto max-h-[700px] custom-scrollbar relative">
          {TIME_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-slate-50 last:border-b-0 min-h-[80px]">
              <div className="p-3 border-r border-slate-100 flex items-start justify-center">
                <span className="text-[10px] font-bold text-slate-400 tabular-nums opacity-60 tracking-tighter">{time}</span>
              </div>
              {DAYS.map((day) => (
                <div key={`${day}-${time}`} className="border-r border-slate-50 last:border-r-0 relative p-1 group">
                  {/* Render Courses starting in this hour */}
                  {courses?.filter(c => c.day === day && c.startTime.startsWith(time.split(':')[0])).map(course => {
                    const startHour = parseInt(course.startTime.split(':')[0]);
                    const startMin = parseInt(course.startTime.split(':')[1]);
                    const endHour = parseInt(course.endTime.split(':')[0]);
                    const endMin = parseInt(course.endTime.split(':')[1]);
                    const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    const heightIdx = Math.max(1, durationMin / 60);

                    return (
                      <div 
                        key={course.id}
                        onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                        className={cn(
                          "absolute inset-x-1 top-1 z-10 p-2.5 rounded-2xl border transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:z-50 focus-within:z-50 active:scale-95 flex flex-col justify-between overflow-hidden",
                          course.priority === 'high' ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/10" :
                          course.priority === 'low' ? "bg-slate-50 border-slate-100 text-slate-400" :
                          "bg-white border-slate-100 text-zinc-900 shadow-sm"
                        )}
                        style={{ height: `calc(${heightIdx * 100}% + ${(heightIdx - 1) * 1}px - 8px)` }}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className={cn("text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded", 
                              course.priority === 'high' ? "bg-white/10 text-white/50" : "bg-slate-100 text-slate-400")}>
                               #{course.courseCode}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDelete(course.id!); }}
                                 className={cn("p-1.5 rounded-lg transition-colors", 
                                   course.priority === 'high' ? "hover:bg-white/10 text-white/40" : "hover:bg-red-50 text-slate-300 hover:text-red-500")}>
                                 <Trash2 size={12} />
                               </button>
                            </div>
                          </div>
                          <h4 className="text-[10px] md:text-[11px] font-black leading-tight line-clamp-2 uppercase mt-1">{course.courseName}</h4>
                        </div>
                        
                        <div className="mt-auto pt-2 space-y-1">
                          <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter",
                             course.priority === 'high' ? "text-white/60" : "text-slate-400")}>
                            <Clock size={10} /> {course.startTime} - {course.endTime}
                          </div>
                          {course.room && (
                            <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter truncate",
                               course.priority === 'high' ? "text-white/60" : "text-slate-400")}>
                              <MapPin size={10} /> {course.room}
                            </div>
                          )}
                        </div>

                        {/* Subtle left border for status */}
                        <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", 
                          course.priority === 'high' ? "bg-white/30" : "bg-zinc-200")} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
              <Loader2 className="animate-spin text-zinc-900" size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && (!courses || courses.length === 0) && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-50/50 rounded-3xl border border-dashed border-slate-200">
           <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm">
             <Clock size={32} className="text-slate-200" />
           </div>
           <div>
             <h3 className="text-sm font-black text-zinc-900 uppercase">No Classes Yet</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Import your schedule or add your first course manually</p>
           </div>
        </div>
      )}

      {/* Modals */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        course={editingCourse}
        dict={dict}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportSuccess}
        dict={dict}
      />

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={lang === 'id' ? "Hapus Mata Kuliah" : "Delete Course"}
        message={lang === 'id' ? "Apakah Anda yakin ingin menghapus mata kuliah ini?" : "Are you sure you want to delete this course?"}
        variant="danger"
      />
    </div>
  );
};

export default ScheduleView;
