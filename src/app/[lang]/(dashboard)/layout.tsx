import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/layout/DashboardShell";
import FloatingChat from "@/components/chat/FloatingChat";
import OnboardingModal from "@/components/dashboard/layout/OnboardingModal";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);
  const session = await auth();

  let needsOnboarding = false;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true }
    });
    if (dbUser && !dbUser.username) {
      needsOnboarding = true;
    }
  }

  return (
    <>
      <DashboardShell 
        lang={lang} 
        dict={dict} 
        session={session}
      >
        {children}
        <FloatingChat lang={lang} dict={dict} />
      </DashboardShell>
      {/* Onboarding intercept */}
      <OnboardingModal isOpen={needsOnboarding} dict={dict} />
    </>
  );
}
