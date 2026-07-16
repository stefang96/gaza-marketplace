import { Logo } from "./Logo";
import { getT } from "@/i18n/server";

export async function SiteFooter() {
  const { t } = await getT();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm text-muted">{t.footer.tagline}</span>
        </div>
        <p className="text-xs text-muted">{t.footer.mvpNote}</p>
      </div>
    </footer>
  );
}
