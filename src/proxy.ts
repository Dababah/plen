import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { auth } from "./auth";

// Combined Auth & i18n Proxy (New Next.js v16 Convention)
export default auth((req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. BLOCK: Ignore static files and internal paths
  // This is critical to prevent /en/auth-graphic.png 404 errors
  const isStaticFile = pathname.includes('.') || 
                       pathname.startsWith('/_next') || 
                       pathname.startsWith('/api');

  if (isStaticFile) {
    return NextResponse.next();
  }

  // 2. BLOCK: Handle Localization (i18n)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;
    
    // Redirect to default locale (e.g. /login -> /en/login)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        req.url
      )
    );
  }

  return NextResponse.next();
});

export const config = {
  // Use a broad matcher; logic inside the function handles exclusions safely
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
