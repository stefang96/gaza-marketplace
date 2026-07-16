import Link from "next/link";
import { Logo } from "./Logo";
import { Avatar } from "./ui/Avatar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { SignOutButton } from "@/features/auth/SignOutButton";

export async function SiteHeader() {
  const [user, { t }] = await Promise.all([getSessionUser(), getT()]);
  const isOrganizer = user?.role === "ORGANIZER";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {!user && (
              <>
                <NavLink href="/za-organizatore">{t.header.forOrganizers}</NavLink>
                <NavLink href="/za-izvodjace">{t.header.forArtists}</NavLink>
              </>
            )}
            {user && isOrganizer && (
              <>
                <NavLink href="/pretraga">{t.header.search}</NavLink>
                <NavLink href="/moji-upiti">{t.header.myBookings}</NavLink>
              </>
            )}
            {user && !isOrganizer && (
              <>
                <NavLink href="/panel">{t.header.panel}</NavLink>
                <NavLink href="/panel/izvodjaci">{t.header.artists}</NavLink>
              </>
            )}
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[10px] px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </Link>
  );
}
