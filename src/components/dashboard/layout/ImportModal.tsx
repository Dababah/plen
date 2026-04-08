"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  FileUp, 
  Loader2, 
  Check, 
  AlertCircle,
  Clock,
  MapPin,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/types/courses";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (courses: Course[]) => void | Promise<void>;
  dict: any;
}

const ImportModal = ({
  isOpen,
  onClose,
  onImport,
  dict
}: ImportModalProps) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [mode, setMode] = useState<"file" | "manual">("manual");
  const [parsedData, setParsedData] = useState<Course[] | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const parseScheduleData = (text: string): Course[] => {
    const lines = text.trim().split("\n");
    const scheduleList: Course[] = [];

    lines.forEach((line) => {
      const columns = line.split("\t").map((col) => col.trim());

      // Portal Universitas usually has 7-8 columns
      if (columns.length >= 7) {
        const hari = columns[0];
        const jam = columns[1];
        const kodeMK = columns[2];
        const namaMK = columns[3];
        const kelas = columns[4];
        const dosen = columns[5]?.replace(";", "") || "";
        const ruang = columns[6];

        if (!hari || !jam) return;

        let startTime = "";
        let endTime = "";
        if (jam.includes("-")) {
          const timeSplit = jam.split("-");
          startTime = timeSplit[0].trim();
          endTime = timeSplit[1].trim();
        }

        scheduleList.push({
          courseCode: kodeMK,
          courseName: namaMK,
          day: hari,
          className: kelas,
          startTime: startTime,
          endTime: endTime,
          lecturer: dosen || "Belum ditentukan",
          room: ruang,
          priority: "medium",
        });
      }
    });

    return mergeConsecutiveClasses(scheduleList);
  };

  const mergeConsecutiveClasses = (scheduleList: Course[]) => {
    const merged: Course[] = [];
    scheduleList.forEach((current) => {
      const existingIndex = merged.findIndex(
        (item) => item.courseCode === current.courseCode && item.day === current.day
      );
      if (existingIndex !== -1) {
        merged[existingIndex].endTime = current.endTime;
      } else {
        merged.push(current);
      }
    });
    return merged;
  };

  const handleManualProcess = () => {
    if (!rawText.trim()) return;
    const result = parseScheduleData(rawText);
    setParsedData(result);
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/courses/parse", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setParsedData(data.mockData || []); // Using data from API
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData) return;
    setLoading(true);
    try {
      // Create each course in the DB
      for (const course of parsedData) {
        await fetch("/api/courses", {
          method: "POST",
          body: JSON.stringify(course),
        });
      }
      onImport(parsedData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setParsedData(null);
      setFile(null);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
              <FileUp size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 leading-tight uppercase tracking-tight">
                Import Schedule
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => { setMode("manual"); setParsedData(null); }}
                  className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all", 
                    mode === "manual" ? "bg-zinc-900 text-white" : "text-slate-400 hover:text-zinc-600")}
                >
                  Manual Paste
                </button>
                <button 
                  onClick={() => { setMode("file"); setParsedData(null); }}
                  className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all", 
                    mode === "file" ? "bg-zinc-900 text-white" : "text-slate-400 hover:text-zinc-600")}
                >
                  File Upload
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!parsedData ? (
            <div className="space-y-6">
              {mode === "file" ? (
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <FileUp size={24} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-900 uppercase">Upload Schedule</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF or image supported</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
                      className="hidden"
                      id="schedule-upload"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("schedule-upload")?.click()}
                      className="mt-2 px-4 py-2 bg-white text-zinc-900 border border-slate-200 rounded-xl text-[10px] font-black shadow-sm uppercase tracking-widest hover:border-zinc-300 transition-all"
                    >
                      {file ? file.name : "Select File"}
                    </button>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-blue-700/80 font-bold uppercase leading-relaxed tracking-wider">
                      Our AI will try to extract your University schedule from the template provided. Please verify the results before saving.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">Paste Portal Text Here</label>
                    <textarea
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl min-h-[180px] text-[11px] font-mono text-zinc-600 focus:ring-2 focus:ring-zinc-900 outline-none transition-all custom-scrollbar"
                      placeholder="Paste your portal table data here (Ctrl+V)..."
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                    />
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-slate-100">
                    <AlertCircle size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                      Copy the whole table from your University portal and paste it above. We will handle the tab-separated columns for you.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest pl-1">Extracted Courses ({parsedData.length})</h3>
              <div className="grid grid-cols-1 gap-2">
                {parsedData.map((course, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm transition-all hover:border-zinc-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black text-zinc-900 px-1.5 py-0.5 bg-zinc-50 rounded border border-slate-100 opacity-60">#{course.courseCode}</span>
                        <h4 className="text-[10px] font-black text-zinc-900 uppercase">{course.courseName}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={10} /> {course.day}, {course.startTime} - {course.endTime}
                        </div>
                        {course.room && (
                          <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            <MapPin size={10} /> {course.room}
                          </div>
                        )}
                      </div>
                    </div>
                    <Check size={16} className="text-green-500 opacity-20" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-10 text-[xs] font-black text-slate-400 hover:text-zinc-900 transition-all uppercase tracking-widest border border-slate-100 rounded-xl bg-zinc-50/50"
          >
            Cancel
          </button>
          {!parsedData ? (
            mode === "file" ? (
              <button
                onClick={handleParse}
                disabled={loading || !file}
                className="flex-1 max-w-[180px] h-11 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Parse AI File</>}
              </button>
            ) : (
              <button
                onClick={handleManualProcess}
                disabled={!rawText.trim()}
                className="flex-1 max-w-[180px] h-11 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <><Check size={16} /> Process Text</>
              </button>
            )
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 max-w-[180px] h-11 bg-zinc-900 text-white rounded-xl text-xs font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save All</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImportModal;
