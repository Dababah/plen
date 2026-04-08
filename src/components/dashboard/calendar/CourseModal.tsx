"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Clock,
  MapPin,
  User as UserIcon,
  Loader2,
  BookOpen,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/types/courses";

interface CourseModalProps {
  course?: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void | Promise<void>;
  dict: any;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const CourseModal = ({
  course,
  isOpen,
  onClose,
  onSave,
  dict
}: CourseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Course>({
    day: "Senin",
    startTime: "08:00",
    endTime: "10:00",
    courseCode: "",
    courseName: "",
    className: "",
    lecturer: "",
    room: "",
    priority: "medium",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        priority: (course.priority as any) || "medium"
      });
    } else {
      setFormData({
        day: "Senin",
        startTime: "08:00",
        endTime: "10:00",
        courseCode: "",
        courseName: "",
        className: "",
        lecturer: "",
        room: "",
        priority: "medium",
      });
    }
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 leading-tight uppercase tracking-tight">
                {course ? "Edit Class" : "Add Class"}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                University Schedule Entry
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Main Info */}
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Course Code</label>
                <input
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                  required
                  placeholder="TI603"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Course Name</label>
                <input
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  required
                  placeholder="Digital Marketing..."
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Importance / Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={cn(
                      "h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      formData.priority === p
                        ? p === 'high' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/20" : "bg-white text-zinc-900 border-zinc-300 shadow-sm"
                        : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:text-zinc-600"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <Calendar size={12} strokeWidth={3} /> Day
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Class</label>
                <input
                  value={formData.className || ""}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. A, B, R1"
                  className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-zinc-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <UserIcon size={12} strokeWidth={3} /> Lecturer
              </label>
              <input
                value={formData.lecturer || ""}
                onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                placeholder="Dr. John Doe..."
                className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <MapPin size={12} strokeWidth={3} /> Room / Location
              </label>
              <input
                value={formData.room || ""}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Lantai 4, Ruang 402..."
                className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-10 text-[10px] font-black text-slate-400 hover:text-zinc-900 transition-all uppercase tracking-widest border border-slate-100 rounded-xl bg-zinc-50/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 max-w-[150px] h-11 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CourseModal;
