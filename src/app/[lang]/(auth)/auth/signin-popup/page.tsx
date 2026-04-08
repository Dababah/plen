"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SigninPopupPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const provider = searchParams.get("provider");

  useEffect(() => {
    if (provider) {
      // Trigger sign in inside the popup
      // callbackUrl is the page that will close the popup
      signIn(provider, { 
        callbackUrl: `/${lang}/auth/callback`,
        redirect: true 
      });
    }
  }, [provider, lang]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-zinc-900 gap-4">
      <Loader2 className="animate-spin text-zinc-800" size={40} />
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
        Connecting to {provider}...
      </p>
    </div>
  );
}
