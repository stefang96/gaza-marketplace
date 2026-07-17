import Link from "next/link";
import { Logo } from "./Logo";
import { Avatar } from "./ui/Avatar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav, type NavItem } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { SignOutButton } from "@/features/auth/SignOutButton";

export async function SiteHeader() {
  const [user, { t }] = await Promise.all([getSessionUser(), getT()]);
  const isOrganizer = user?.role === "ORGANIZER";

  // Core nav per role (desktop tabs).
  const navItems: NavItem[] = !user
    ? [
        { href: "/za-organizatore", label: t.header.forOrganizers },
        { href: "/za-izvodjace", label: t.header.forArtists },
      ]
    : isOrganizer
      ? [
          { href: "/pretraga", label: t.header.search },
          { href: "/moji-upiti", label: t.header.myBookings },
        ]
      : [
          { href: "/panel", label: t.header.panel },
          { href: "/panel/izvodjaci", label: t.header.artists },
        ];

  // Mobile menu adds auth links for guests.
  const mobileItems: NavItem[] = !user
    ? [
        ...navItems,
        { href: "/prijava", label: t.header.login },
        { href: "/registracija", label: t.header.register },
      ]
    : navItems;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 md:gap-8">
          <MobileNav items={mobileItems} />
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLinks items={navItems} />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          {!user && (
            <>
              <Link href="/prijava" className="btn-ghost hidden sm:inline-flex">
                {t.header.login}
              </Link>
              <Link href="/registracija" className="btn-primary">
                {t.header.register}
              </Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold leading-tight text-ink">
                  {user.name}
                </div>
                <div className="text-xs text-muted">{t.roles[user.role]}</div>
              </div>
              <Avatar name={user.name} color={user.avatarColor} size="md" />
              <SignOutButton title={t.header.signOut} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
