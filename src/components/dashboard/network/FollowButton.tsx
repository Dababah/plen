"use client";

import React, { useState } from "react";
import { UserPlus, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

export default function FollowButton({ 
  targetUserId, 
  initialFollowing, 
  className = "",
  size = "md",
  variant = "primary"
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent triggering parent links if embedded inside a Link component
    
    setLoading(true);
    try {
      const res = await fetch("/api/network/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        // Refresh the router to update counts on SSR pages if needed
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "w-full md:w-auto px-8 py-3 text-base gap-2" // standard for profile page
  };

  const variantClasses = isFollowing
    ? "bg-slate-100 text-zinc-900 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-slate-200"
    : "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900";

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`rounded-xl font-bold transition-all flex items-center justify-center shadow-sm disabled:opacity-70 disabled:scale-100 active:scale-95 group ${sizeClasses[size]} ${variantClasses} ${className}`}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 18} className="animate-spin" />
      ) : isFollowing ? (
        <>
          <span className="group-hover:hidden flex items-center gap-2"><Check size={size === "sm" ? 14 : 18} /> Following</span>
          <span className="hidden group-hover:block">Unfollow</span>
        </>
      ) : (
        <><UserPlus size={size === "sm" ? 14 : 18} /> Follow</>
      )}
    </button>
  );
}
