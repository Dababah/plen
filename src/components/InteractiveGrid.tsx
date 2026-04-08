"use client";

import React, { useRef, useEffect } from "react";

const InteractiveGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -2000;
    let mouseY = -2000;

    const dots: { x: number; y: number; originX: number; originY: number }[] = [];
    const spacing = 32; 
    const baseDotSize = 1.2;
    const mouseRadius = 140;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots.length = 0;
      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          dots.push({ x, y, originX: x, originY: y });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Control base visibility here - NO globalAlpha dependencies for the grid
      dots.forEach((dot) => {
        const dx = mouseX - dot.originX;
        const dy = mouseY - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let currentX = dot.originX;
        let currentY = dot.originY;
        let currentSize = baseDotSize;
        let fillColor = "rgba(100, 116, 139, 0.45)"; // Clearly visible slate-500 with mid-opacity

        if (dist < mouseRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseRadius - dist) / mouseRadius;
          
          // Smooth Wave Displacement
          currentX = dot.originX - Math.cos(angle) * force * 15;
          currentY = dot.originY - Math.sin(angle) * force * 15;
          
          // Interaction Styling
          currentSize = baseDotSize + (force * 2.5);
          fillColor = `rgba(30, 41, 59, ${0.45 + (force * 0.4)})`; // Darkens to slate-800 on hover
        }

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default InteractiveGrid;
