"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Tag, 
  Link as LinkIcon, 
  MoreVertical,
  Clock,
  Pin,
  Trash2,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import NoteModal from "./NoteModal";

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  updatedAt: Date | string;
  isPinned?: boolean;
}

interface NotesViewProps {
  initialNotes: Note[];
  lang: string;
  dict: any;
}

const NotesView = ({ initialNotes, lang, dict }: NotesViewProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpenId]);

  // Fetch Notes on Mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.error("Failed to fetch initial notes:", err);
      }
    };
    fetchNotes();
  }, []);

  // Sorting & Filtering: Pinned first, then by date. Then filter by search.
  const filteredNotes = useMemo(() => {
    const sorted = [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (!search.trim()) return sorted;
    
    const query = search.toLowerCase();
    return sorted.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query) ||
      (n.category && n.category.toLowerCase().includes(query))
    );
  }, [notes, search]);

  // Handlers
  const openNewModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(lang === 'id' ? 'Hapus catatan ini?' : 'Delete this note?')) return;

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: Note, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIsPinned = !note.isPinned;
    
    // Optimistic UI update
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: newIsPinned } : n));

    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newIsPinned })
      });
    } catch (err) {
      // Revert on fail
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: note.isPinned } : n));
      console.error(err);
    }
  };

  const handleSaveNote = async (data: { id?: string; title: string; content: string; category?: string; isPinned?: boolean }) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/notes/${data.id}` : '/api/notes';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to save");

    const savedNote = await res.json();
    
    if (isEdit) {
      setNotes(prev => prev.map(n => n.id === savedNote.id ? savedNote : n));
    } else {
      setNotes(prev => [savedNote, ...prev]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {/* Controls only */}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56 lg:w-64 group">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-zinc-900 transition-colors" />
             <input 
               type="text" 
               placeholder={dict.notes.search} 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all font-medium placeholder:text-slate-300 shadow-sm"
             />
          </div>
          <button 
            onClick={openNewModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{lang === 'id' ? 'Catatan Baru' : 'Add note'}</span>
          </button>
        </div>
      </div>

      {/* Notes Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
        {filteredNotes.map((note) => (
          <div 
            key={note.id} 
            onClick={() => openEditModal(note)}
            className="break-inside-avoid p-5 md:p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer group relative hover:z-[50]"
          >
             {/* Subtle Glow Effect on Hover - Adjusted to not need overflow-hidden on parent if possible, or just accept overflow for menu */}
             <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] pointer-events-none" />

             <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={cn(
                  "p-2.5 rounded-xl border transition-all duration-300",
                  note.isPinned 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-200" 
                    : "bg-slate-50 text-slate-400 group-hover:text-zinc-600 group-hover:bg-zinc-100 border-transparent"
                )}>
                   <FileText size={16} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1">
                   <button 
                     onClick={(e) => handleTogglePin(note, e)}
                     className="p-1.5 text-slate-300 hover:text-zinc-900 transition-colors"
                     title={lang === 'id' ? 'Sematkan' : 'Pin note'}
                   >
                     <Pin size={16} strokeWidth={2.5} className={note.isPinned ? 'text-zinc-900 fill-zinc-900' : ''} />
                   </button>
                   <div className="relative group/menu">
                     <button 
                       onClick={(e) => e.stopPropagation()}
                       className="p-1.5 text-slate-300 hover:text-zinc-900 transition-colors"
                     >
                        <MoreVertical size={16} />
                     </button>
                     {/* Dropdown Options Hover - Fixed positioning and z-index */}
                     <div className="absolute right-0 top-full mt-1 w-32 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-[100] flex flex-col p-1.5 ring-1 ring-black/5 translate-y-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(note); }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl w-full text-left transition-colors"
                        >
                          <Edit size={12} strokeWidth={3} /> {lang === 'id' ? 'Edit' : 'Edit'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id, e); }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl w-full text-left transition-colors"
                        >
                          <Trash2 size={12} strokeWidth={3} /> {lang === 'id' ? 'Hapus' : 'Delete'}
                        </button>
                     </div>
                   </div>
                </div>
             </div>

             <h3 className="text-[15px] font-black text-zinc-900 mb-2 leading-tight truncate relative z-10">
               {note.title}
             </h3>
             
             <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-5 line-clamp-4 whitespace-pre-wrap relative z-10">
                {note.content}
             </p>

             <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                   {note.category && (
                     <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 text-[10px] font-black text-slate-500 border border-zinc-100 max-w-[120px] truncate shadow-sm">
                        <Tag size={10} strokeWidth={3} className="shrink-0 text-zinc-400" /> <span className="truncate uppercase tracking-wider">{note.category}</span>
                     </div>
                   )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                   <Clock size={10} />
                   {new Date(note.updatedAt).toLocaleDateString()}
                </div>
             </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="py-12 bg-white rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-3 w-full break-inside-avoid">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
                <FileText size={20} />
             </div>
             <div>
                <p className="text-slate-400 font-medium text-xs mb-0.5">{dict.notes.empty}</p>
                <p className="text-[10px] text-slate-300 font-normal max-w-[200px]">{dict.notes.emptyDesc}</p>
             </div>
             <button 
               onClick={openNewModal}
               className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-transform"
             >
                {lang === 'id' ? 'Buat Catatan' : 'Create note'}
             </button>
          </div>
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingNote}
        onSave={handleSaveNote}
        lang={lang}
        dict={dict}
      />
    </div>
  );
};

export default NotesView;
