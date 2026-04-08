"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="text-red-500" size={24} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={24} />;
      case "info":
        return <Info className="text-blue-500" size={24} />;
      default:
        return <AlertCircle className="text-zinc-500" size={24} />;
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-[360px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header / Icon Area */}
            <div className="pt-8 pb-4 flex flex-col items-center">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all",
                variant === 'danger' ? "bg-red-50" : variant === 'warning' ? "bg-amber-50" : "bg-blue-50"
              )}>
                {getIcon()}
              </div>
              <h3 className="text-sm font-black text-zinc-900 tracking-tight uppercase">{title}</h3>
            </div>

            {/* Message Area */}
            <div className="px-8 pb-8 text-center">
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions Area */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl bg-zinc-50 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "flex-1 h-12 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                  variant === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : 
                  variant === 'warning' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : 
                  "bg-zinc-900 hover:bg-zinc-800 shadow-zinc-900/20"
                )}
              >
                {confirmText}
              </button>
            </div>

            {/* Close button (top right) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
