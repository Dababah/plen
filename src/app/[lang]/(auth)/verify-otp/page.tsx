"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { verifyOTP } from "@/lib/actions/auth-actions";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.push(`/${lang}/forgot-password`);
    }
  }, [email, router, lang]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) return;

    setIsLoading(true);
    setError(null);

    const result = await verifyOTP(email, token);

    if (result.success) {
      router.push(`/${lang}/reset-password?email=${encodeURIComponent(email)}&token=${token}`);
    } else {
      setError(result.error || (lang === "id" ? "Kode OTP tidak valid." : "Invalid OTP code."));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 fade-in px-2">
      <Link 
        href={`/${lang}/forgot-password`} 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        {lang === "id" ? "Kembali" : "Back"}
      </Link>

      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === "id" ? "Verifikasi OTP" : "Verify OTP"}
          </h1>
          <p className="text-slate-500 text-[13px]">
            {lang === "id" 
              ? `Masukkan 6 digit kode yang dikirim ke ${email}` 
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                ref={(el) => { inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-10 h-12 text-center text-xl font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all"
              />
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || otp.join("").length < 6} 
            className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200/50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (lang === "id" ? "Verifikasi" : "Verify")}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400">
          {lang === "id" ? "Tidak menerima kode?" : "Didn't receive the code?"}{" "}
          <button 
            onClick={() => router.push(`/${lang}/forgot-password?resend=true`)}
            className="text-zinc-800 font-bold hover:text-black hover:underline"
          >
            {lang === "id" ? "Kirim ulang" : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}
