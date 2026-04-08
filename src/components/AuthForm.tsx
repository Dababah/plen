"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Chrome, Mail, Lock, UserCircle, Loader2, AtSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  type: "login" | "register";
  dict: any;
  lang: string;
}

const AuthForm = ({ type, dict, lang }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const isLogin = type === "login";
  const authDict = isLogin ? dict.auth.login : dict.auth.register;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const schema = isLogin ? loginSchema : registerSchema;
      const result = schema.safeParse(data);

      if (!result.success) {
        setFieldErrors(result.error.flatten().fieldErrors);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const signInResult = await signIn("credentials", {
          email: data.email as string,
          password: data.password as string,
          redirect: false,
        });

        if (signInResult?.error) {
          if (signInResult.error === "SocialLoginOnly") {
            setError(lang === "id" 
              ? "Akun ini didaftarkan menggunakan Google/GitHub. Silakan login menggunakan layanan tersebut." 
              : "This account was registered using Google/GitHub. Please login using that service.");
          } else {
            setError(lang === "id" ? "Email atau password salah." : "Invalid email or password.");
          }
        } else {
          router.push(`/${lang}/dashboard`);
          router.refresh();
        }
      } else {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          router.push(`/${lang}/login?success=account-created`);
        } else {
          const resData = await response.json();
          if (resData.error && typeof resData.error === "object") {
            setFieldErrors(resData.error);
          } else {
            setError(resData.error || (lang === "id" ? "Gagal membuat akun." : "Failed to create account."));
          }
        }
      }
    } catch (err) {
      setError(lang === "id" ? "Terjadi kesalahan sistem. Silakan coba lagi." : "System error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    if (provider === "github") {
      signIn("github", { callbackUrl: `/${lang}/dashboard` });
      return;
    }

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/${lang}/auth/signin-popup?provider=${provider}`,
      "Social Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "AUTH_SUCCESS") {
        window.removeEventListener("message", handleMessage);
        window.location.href = `/${lang}/dashboard`;
      }
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="w-full max-w-[260px] mx-auto space-y-1 animate-in fade-in duration-500">
      <div className="text-center space-y-0.5">
        <h1 className="text-base font-bold tracking-tight text-zinc-900">
          {authDict.title}
        </h1>
        <p className="text-slate-500 text-[10px]">
          {authDict.description}
        </p>
      </div>

      {error && (
        <div className="p-2.5 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-1">
        {!isLogin && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label htmlFor="firstName" className="text-[10px] font-semibold text-zinc-700 pl-0.5">{dict.auth.fields.firstName}</label>
                <div className="relative">
                  <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input 
                    id="firstName"
                    name="firstName" 
                    required 
                    autoComplete="given-name"
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-[10px] focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="First name" 
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[9px] text-red-500 mt-0.5 pl-1">{fieldErrors.firstName[0]}</p>
                  )}
                </div>
              </div>
              <div className="space-y-0.5">
                <label htmlFor="lastName" className="text-[10px] font-semibold text-zinc-700 pl-0.5">{dict.auth.fields.lastName}</label>
                <div className="relative">
                  <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input 
                    id="lastName"
                    name="lastName" 
                    required 
                    autoComplete="family-name"
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-[10px] focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="Last name" 
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[9px] text-red-500 mt-0.5 pl-1">{fieldErrors.lastName[0]}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <label htmlFor="username" className="text-[10px] font-semibold text-zinc-700 pl-0.5">{dict.auth.fields.username}</label>
              <div className="relative">
                <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input 
                  id="username"
                  name="username" 
                  autoComplete="off"
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-[10px] focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-300" 
                  placeholder="Username" 
                />
                {fieldErrors.username && (
                  <p className="text-[9px] text-red-500 mt-0.5 pl-1">{fieldErrors.username[0]}</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-0.5">
          <label htmlFor="email" className="text-[10px] font-semibold text-zinc-700 pl-0.5">{dict.auth.fields.email}</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input 
              id="email"
              name="email" 
              type="email" 
              autoComplete="email username"
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-[10px] focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-300" 
              placeholder="Email address" 
            />
            {fieldErrors.email && (
              <p className="text-[9px] text-red-500 mt-0.5 pl-1">{fieldErrors.email[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          <label htmlFor="password" className="text-[10px] font-semibold text-zinc-700 pl-0.5">{dict.auth.fields.password}</label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input 
              id="password"
              name="password" 
              type="password" 
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-[10px] focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition-all placeholder:text-slate-300" 
              placeholder="Password" 
            />
            {fieldErrors.password && (
              <p className="text-[9px] text-red-500 mt-0.5 pl-1">{fieldErrors.password[0]}</p>
            )}
          </div>
        </div>

        {type === "login" && (
          <div className="flex justify-end pt-0.5">
            <Link 
              href={`/${lang}/forgot-password`} 
              className="text-[10px] font-semibold text-zinc-600 hover:text-black transition-colors"
              tabIndex={-1}
            >
              {authDict.forgotPassword || (lang === "id" ? "Lupa kata sandi?" : "Forgot password?")}
            </Link>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-8 mt-0.5 flex items-center justify-center gap-2 bg-zinc-900 text-[11px] font-semibold text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : authDict.button}
        </button>
      </form>

      <div className="flex items-center gap-3 py-0.5">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[9px] text-slate-400 font-semibold">Or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => handleSocialLogin("github")} 
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-zinc-900 transition-all active:scale-[0.98]"
        >
          <Github size={12} />
          <span className="text-[9px] font-semibold">GitHub</span>
        </button>
        <button 
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading} 
          className="flex items-center justify-center gap-2 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-zinc-900 transition-all active:scale-[0.98]"
        >
          <Chrome size={12} />
          <span className="text-[9px] font-semibold">Google</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500 pt-0.5">
        {isLogin ? (
          <>
            {authDict.noAccount}{" "}
            <Link href={`/${lang}/register`} className="text-zinc-900 font-bold hover:underline decoration-1 ml-1">
              {authDict.registerLink}
            </Link>
          </>
        ) : (
          <>
            {authDict.hasAccount}{" "}
            <Link href={`/${lang}/login`} className="text-zinc-900 font-bold hover:underline decoration-1 ml-1">
              {authDict.loginLink}
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
