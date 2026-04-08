"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  useEffect(() => {
    // Check if we are in a popup
    if (window.opener) {
      // Small delay to ensure cookies are fully set before parent tries to redirect
      setTimeout(() => {
        // Send message to parent window to notify success
        window.opener.postMessage({ type: "AUTH_SUCCESS" }, window.location.origin);
        // Close the popup
        window.close();
      }, 500);
    } else {
      // If not in a popup, redirect to dashboard manually (fallback)
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-zinc-900 gap-4">
      <Loader2 className="animate-spin text-zinc-800" size={40} />
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
        Authenticating...
      </p>
    </div>
  );
}
