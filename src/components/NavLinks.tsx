"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./MobileNav";

// Desktop nav with an active-tab highlight. Active = the item whose href is the
// longest prefix of the current path (so /panel/izvodjaci highlights "Izvođači",
// not "Panel").
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const activeHref = items
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-[10px] bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-strong"
                : "rounded-[10px] px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
