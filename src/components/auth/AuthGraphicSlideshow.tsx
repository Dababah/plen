"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthGraphicSlideshowProps {
  dict: {
    heroTitle: string;
    heroDescription: string;
  };
}

const images = [
  "/auth-graphic.png",
  "/auth-grapic2.png",
  "/auth-grapic3.png",
];

const AuthGraphicSlideshow = ({ dict }: AuthGraphicSlideshowProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000); // 8 seconds per slide for smooth zooming
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex md:w-[290px] relative overflow-hidden group border-l border-slate-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            src={images[index]}
            alt={`Auth Graphic ${index + 1}`}
            initial={{ scale: index % 2 === 0 ? 1 : 1.15 }}
            animate={{ scale: index % 2 === 0 ? 1.15 : 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay z-10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 mt-auto p-6 space-y-2">
        <motion.h3 
          key={`title-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-xl font-bold text-white leading-tight" 
          dangerouslySetInnerHTML={{ __html: dict.heroTitle }}
        />
        <motion.p 
          key={`desc-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-slate-300 text-[11px] max-w-[200px] font-medium leading-relaxed"
        >
          {dict.heroDescription}
        </motion.p>
        
        <div className="pt-4 flex gap-2">
          {images.map((_, i) => (
            <div 
              key={i}
              className={`h-1 transition-all duration-700 rounded-full ${
                i === index ? "w-8 bg-white" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthGraphicSlideshow;
