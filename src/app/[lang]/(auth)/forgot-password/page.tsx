"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { sendOTP } from "@/lib/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Throttling: prevent multiple requests

    setIsLoading(true);
    setMessage(null);

    const result = await sendOTP(email);

    if (result.success) {
      setMessage({
        type: "success",
        text: lang === "id" ? "OTP telah dikirim ke email Anda." : "OTP has been sent to your email.",
      });
      // Delay navigation to let user see success message
      setTimeout(() => {
        router.push(`/${lang}/verify-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } else {
      setMessage({
        type: "error",
        text: result.error || (lang === "id" ? "Gagal mengirim OTP." : "Failed to send OTP."),
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 fade-in px-2">
      <Link 
        href={`/${lang}/login`} 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        {lang === "id" ? "Kembali ke Login" : "Back to Login"}
      </Link>

      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === "id" ? "Lupa Kata Sandi" : "Forgot Password"}
          </h1>
          <p className="text-slate-500 text-[13px]">
            {lang === "id" 
              ? "Masukkan email Anda untuk menerima kode verifikasi OTP." 
              : "Enter your email to receive an OTP verification code."
            }
          </p>
        </div>

        {message && (
          <div className={`p-3 text-sm rounded-lg text-center border ${
            message.type === "success" 
              ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
              : "text-red-600 bg-red-50 border-red-100"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-400" 
                placeholder="m@example.com" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200/50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (lang === "id" ? "Kirim OTP" : "Send OTP")}
          </button>
        </form>
      </div>
    </div>
  );
}
