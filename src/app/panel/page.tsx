import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Panel · Gaža" };

// Placeholder — menadžerski panel / inbox stiže u sledećem koraku (M5–M6).
export default async function PanelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/prijava?next=/panel");
  if (user.role === "ORGANIZER") redirect("/pretraga");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="card p-8 text-center">
        <div className="mb-3 text-4xl">🎛️</div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Zdravo, {user.name}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Menadžerski panel — roster izvođača, jedinstven inbox upita, detalj sa
          escrow stepper-om i akcije „Prihvati / Odbij“ — stiže u sledećem koraku
          (M5–M6).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">
            Početna
          </Link>
          <Link href="/za-izvodjace" className="btn-ghost">
            Za izvođače
          </Link>
        </div>
      </div>
    </div>
  );
}
