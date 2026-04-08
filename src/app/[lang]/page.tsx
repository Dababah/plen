import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Github as GithubIcon, Chrome as GoogleIcon, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function LandingPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect(`/${lang}/dashboard`);
  }

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar lang={lang} dict={dict} />
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(0,102,255,0.05)_0%,transparent_100%)]" />
        
        <div className="container mx-auto px-4 text-center space-y-8 fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {dict.landing.badge}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto leading-tight" dangerouslySetInnerHTML={{ __html: dict.landing.heroTitle }}>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {dict.landing.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={`/${lang}/register`} 
              className="group h-12 px-8 flex items-center gap-2 bg-foreground text-background font-semibold rounded-full hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
            >
              {dict.landing.getStarted}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={`/${lang}/login`} 
              className="h-12 px-8 flex items-center bg-background border font-semibold rounded-full hover:bg-accent transition-all"
            >
              {dict.landing.viewDemo}
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale">
            <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tighter">
              <GoogleIcon size={24} /> GOOGLE
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tighter">
              <GithubIcon size={24} /> GITHUB
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tighter text-blue-600">
              <Globe size={24} /> GLOBAL
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tighter text-red-600">
              <Shield size={24} /> SECURE
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-accent/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight">{dict.landing.featuresTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {dict.landing.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dict.landing.features.map((feature: any, i: number) => (
              <div key={i} className="p-8 rounded-3xl bg-background border border-white/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-6">
                  {i === 0 ? <Shield className="text-primary" /> : i === 1 ? <Zap className="text-yellow-500" /> : <Globe className="text-green-500" />}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass p-12 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -z-10" />
            
            <h2 className="text-4xl font-bold tracking-tight">{dict.landing.ctaTitle}</h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              {dict.landing.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium">
              {dict.landing.ctaFeatures.map((feat: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" /> {feat}
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link 
                href={`/${lang}/register`} 
                className="group inline-flex h-14 px-12 items-center bg-foreground text-background font-bold rounded-full hover:opacity-90 transition-all text-lg shadow-2xl"
              >
                {dict.landing.ctaButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 text-sm">
          <p>{dict.footer.copyright}</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">{dict.footer.about}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{dict.footer.privacy}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{dict.footer.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
