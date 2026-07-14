import Link from "next/link";
import { Logo } from "./Logo";
import { Avatar } from "./ui/Avatar";
import { getSessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { SignOutButton } from "@/features/auth/SignOutButton";

export async function SiteHeader() {
  const user = await getSessionUser();
  const isOrganizer = user?.role === "ORGANIZER";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {!user && (
              <>
                <NavLink href="/za-organizatore">Za organizatore</NavLink>
                <NavLink href="/za-izvodjace">Za izvođače</NavLink>
              </>
            )}
            {user && isOrganizer && (
              <>
                <NavLink href="/pretraga">Pretraga</NavLink>
                <NavLink href="/moji-upiti">Moji upiti</NavLink>
              </>
            )}
            {user && !isOrganizer && (
              <>
                <NavLink href="/panel">Panel</NavLink>
                <NavLink href="/panel/izvodjaci">Izvođači</NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link href="/prijava" className="btn-ghost hidden sm:inline-flex">
                Prijava
              </Link>
              <Link href="/registracija" className="btn-primary">
                Registracija
              </Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold leading-tight text-ink">
                  {user.name}
                </div>
                <div className="text-xs text-muted">{ROLE_LABELS[user.role]}</div>
              </div>
              <Avatar name={user.name} color={user.avatarColor} size="md" />
              <SignOutButton />
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
