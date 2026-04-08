"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserCircle, LogOut, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  lang: string;
  dict: any;
}

const Navbar = ({ lang, dict }: NavbarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide navbar on auth and dashboard/profile pages
  const isAuthPage = 
    pathname === `/${lang}/login` || 
    pathname === `/${lang}/register` ||
    pathname?.startsWith(`/${lang}/dashboard`) ||
    pathname?.startsWith(`/${lang}/profile`);
  
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${lang}`} className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
          AXION.
        </Link>
...
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link 
                href={`/${lang}/dashboard`} 
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">{dict.navbar.dashboard}</span>
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: `/${lang}` })}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{dict.navbar.logout}</span>
              </button>
...
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden border">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-muted-foreground" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={`/${lang}/login`} className="px-4 h-9 flex items-center text-sm font-medium hover:text-primary transition-colors">
                {dict.navbar.login}
              </Link>
              <Link href={`/${lang}/register`} className="px-4 h-9 flex items-center text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
                {dict.navbar.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
