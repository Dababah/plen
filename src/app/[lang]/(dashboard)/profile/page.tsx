import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import ProfileView from "@/components/dashboard/profile/ProfileView";

export default async function ProfilePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session) {
    redirect(`/${lang}/login`);
  }

  // Ensure user data is fresh from DB if needed, but session usually has it
  const user = session.user;

  return (
    <ProfileView user={user} dict={dict} lang={lang} />
  );
}
