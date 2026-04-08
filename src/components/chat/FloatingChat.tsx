"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Trash2, Bot, User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingChat({ lang, dict }: { lang: string, dict: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('ai_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    // Save history to localStorage (max 20 messages)
    if (messages.length > 0) {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages.slice(-20)));
    }
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error("Failed to load settings in chat:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].slice(-10) // Small history context
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: dict.aiChat?.error || "Gagal terhubung ke AI. Cek koneksi Anda." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai_chat_history');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        suppressHydrationWarning
        className={cn(
          "fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-zinc-900 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Slide-in Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[60] flex flex-col transition-transform duration-500 transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <Sparkles size={20} className="animate-pulse" />
             </div>
               <div>
                <h3 className="text-sm font-black text-zinc-900 leading-none">{dict.aiChat?.title || "AI Personal Assistant"}</h3>
                <p className="text-[10px] font-bold mt-1">
                   {!settings ? (
                     <span className="text-slate-400">Loading...</span>
                   ) : settings.aiModel ? (
                     <span className="text-emerald-500">Connected • {settings.aiModel}</span>
                   ) : (
                     <span className="text-rose-500">{lang === 'id' ? 'Butuh Konfigurasi' : 'Setup Required'}</span>
                   )}
                </p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-zinc-900 transition-all border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-10">
               <Bot size={48} className="text-zinc-200" />
               <div>
                  <h4 className="text-sm font-black text-zinc-900">{dict.aiChat?.emptyState || "Halo! Apa yang bisa saya bantu?"}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">
                    {lang === 'id' 
                      ? "Saya punya akses ke data keuangan, tugas, dan portofolio Anda untuk membantu analisis."
                      : "I have access to your financial data, tasks, and portfolio to help with analysis."}
                  </p>
               </div>
               {!settings?.aiApiKeyEncrypted && (
                 <Link 
                   href={`/${lang}/settings`}
                   onClick={() => setIsOpen(false)}
                   className="mt-4 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
                 >
                   {lang === 'id' ? 'Setup AI di Settings' : 'Setup AI in Settings'}
                 </Link>
               )}
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-100",
                msg.role === 'user' ? "bg-zinc-100 text-zinc-500" : "bg-zinc-900 text-white"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "max-w-[85%] p-3 px-4 rounded-2xl text-[13px] leading-relaxed shadow-sm prose prose-sm prose-zinc",
                msg.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none font-medium" 
                  : "bg-white border border-slate-100 text-zinc-700 rounded-tl-none"
              )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-zinc-400" />
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{dict.aiChat?.thinking || "Berpikir..."}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <button 
                type="button"
                onClick={clearChat}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                title={lang === 'id' ? "Hapus obrolan" : "Clear chat"}
            >
                <Trash2 size={18} />
            </button>
            <div className="flex-1 relative">
                <input 
                  type="text"
                  placeholder={dict.aiChat?.placeholder || "Tanya sesuatu..."}
                  className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium focus:ring-2 focus:ring-zinc-900 outline-none transition-all pr-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-900 text-white rounded-lg disabled:opacity-20 transition-all active:scale-95"
                >
                  <Send size={14} />
                </button>
            </div>
          </form>
          <p className="text-[9px] text-center text-slate-400 font-medium mt-3 uppercase tracking-tighter">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[55] animate-in fade-in duration-300"
        />
      )}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={confirmClearChat}
        title={lang === 'id' ? "Hapus Chat" : "Clear Chat"}
        message={lang === 'id' ? "Apakah Anda yakin ingin menghapus semua riwayat percakapan? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to delete all chat history? This action cannot be undone."}
        variant="danger"
      />
    </>
  );
}
