"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth-actions";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!email || !token) {
      router.push(`/${lang}/forgot-password`);
    }
  }, [email, token, router, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(lang === "id" ? "Kata sandi tidak cocok." : "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError(lang === "id" ? "Kata sandi minimal 8 karakter." : "Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await resetPassword(email, token, password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/${lang}/login?success=password-reset`);
      }, 3000);
    } else {
      setError(result.error || (lang === "id" ? "Gagal mereset kata sandi." : "Failed to reset password."));
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center space-y-6 fade-in py-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "id" ? "Kata Sandi Diperbarui!" : "Password Updated!"}
          </h1>
          <p className="text-slate-500 text-sm">
            {lang === "id" 
              ? "Kata sandi Anda telah berhasil diubah. Mengalihkan ke login..." 
              : "Your password has been successfully changed. Redirecting to login..."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 fade-in px-2">
      <Link 
        href={`/${lang}/verify-otp?email=${encodeURIComponent(email)}`} 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        {lang === "id" ? "Kembali ke Verifikasi" : "Back to Verification"}
      </Link>

      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === "id" ? "Atur Ulang Kata Sandi" : "Reset Password"}
          </h1>
          <p className="text-slate-500 text-[13px]">
            {lang === "id" 
              ? "Silakan masukkan kata sandi baru Anda." 
              : "Please enter your new password."
            }
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              {lang === "id" ? "Kata Sandi Baru" : "New Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              {lang === "id" ? "Konfirmasi Kata Sandi" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200/50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (lang === "id" ? "Atur Ulang" : "Reset Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
