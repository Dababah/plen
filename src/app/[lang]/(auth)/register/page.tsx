import AuthForm from "@/components/AuthForm";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage(props: {
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

  return <AuthForm type="register" dict={dict} lang={lang} />;
}
