import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";
import { Inter, Outfit } from "next/font/google";
import "./../globals.css";
import { AuthProvider } from "@/components/Providers";
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "Axion | Modern Platform",
  description: "A premium Next.js landing page with authentication.",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const lang = params.lang as Locale;

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
