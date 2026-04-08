import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import FinanceView from "@/components/dashboard/finance/FinanceView";

export default async function FinancePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const session = await auth();

  if (!session) {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <div className="w-full animate-in fade-in zoom-in duration-700 h-full overflow-hidden">
      <FinanceView lang={lang} dict={dict} />
    </div>
  );
}
