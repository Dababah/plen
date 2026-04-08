"use client";

import React, { useState } from "react";
import { RefreshCw, Check, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_AVATARS, AVATAR_STYLES, AVATAR_SEEDS, generateDiceBearUrl } from "@/lib/constants";

interface AvatarPickerProps {
  currentImage?: string | null;
  onSelect: (url: string) => void;
  lang: string;
}

export default function AvatarPicker({ currentImage, onSelect, lang }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentImage || DEFAULT_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Local list of options
  const [options, setOptions] = useState(DEFAULT_AVATARS);

  const handleRandomize = () => {
    const newOptions = Array.from({ length: 8 }, () => {
      const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
      const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] + Math.random().toString(36).substring(7);
      return generateDiceBearUrl(style, seed);
    });
    setOptions(newOptions);
  };

  const handleSave = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (res.ok) {
        onSelect(url);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to update avatar", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Current Avatar Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group block"
      >
        <div className="absolute inset-0 bg-zinc-900 rounded-full rotate-6 scale-95 opacity-0 group-hover:opacity-5 group-hover:rotate-12 transition-all duration-500" />
        <div className="relative w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl shadow-zinc-200 group-hover:scale-105 transition-transform duration-500">
          <img src={currentImage || selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
        </div>
      </button>

      {/* Picker Popover/Modal */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 z-[100] w-[320px] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">
              {lang === "id" ? "Pilih Avatar" : "Choose Avatar"}
            </h3>
            <button 
              onClick={handleRandomize}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-zinc-900 transition-all active:rotate-180 duration-500"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {options.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAvatar(url)}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 transition-all overflow-hidden bg-slate-50 hover:scale-105 active:scale-95 group/item",
                  selectedAvatar === url 
                    ? "border-zinc-900 ring-4 ring-zinc-900/10" 
                    : "border-transparent hover:border-slate-200"
                )}
              >
                <img src={url} alt={`Option ${idx}`} className="w-full h-full object-cover" />
                {selectedAvatar === url && (
                  <div className="absolute inset-0 bg-zinc-900/10 flex items-center justify-center">
                    <div className="bg-zinc-900 text-white p-0.5 rounded-full ring-2 ring-white">
                      <Check size={10} />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 h-10 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider"
            >
              {lang === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              disabled={loading || selectedAvatar === currentImage}
              onClick={() => handleSave(selectedAvatar)}
              className="flex-[2] h-10 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : (lang === "id" ? "Simpan" : "Save Avatar")}
            </button>
          </div>

          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45" />
        </div>
      )}

      {/* Overlay to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
