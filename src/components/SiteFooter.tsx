import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm text-muted">
            Marketplace za svirke — Balkan i dijaspora
          </span>
        </div>
        <p className="text-xs text-muted">
          MVP · plaćanja i escrow su simulirani u ovoj verziji.
        </p>
      </div>
    </footer>
  );
}
