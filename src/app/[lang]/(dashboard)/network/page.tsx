import { auth } from "@/auth";
import type { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import NetworkView from "@/components/dashboard/network/NetworkView";

export default async function NetworkPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 max-w-2xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-0.5 leading-none">
          Network
        </h1>
        <p className="text-[11px] text-slate-400 font-medium tracking-tight">Connect with friends and discover activities</p>
      </div>

      <NetworkView lang={lang} dict={dict} currentUser={session.user} />
    </div>
  );
}
