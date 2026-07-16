<div align="center">

# 🎷 Gaža

**Marketplace koji povezuje muzičare i bendove sa naručiocima svirki — na Balkanu i u dijaspori.**

Dve ključne vrednosti: **zaštita plaćanja (escrow)** i **logistika za dijasporu**.

[![Live demo](https://img.shields.io/badge/Live_demo-gaza--marketplace-5A4BE3?style=for-the-badge)](https://gaza-marketplace-ruddy.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_Auth-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

> [!NOTE]
> MVP za validaciju i prezentaciju. Escrow i plaćanja su **simulirani** (bez pravog PSP-a, bez kartičnih podataka).

---

## ✨ Šta Gaža radi

Tri tipa korisnika — **Naručilac** (traži bend), **Izvođač** i **Menadžer** (vodi više izvođača) — sa dve okosnice proizvoda:

- 🛡️ **Zaštita plaćanja (escrow)** — naručilac uplaćuje pre nastupa; novac stoji „na čekanju" i pušta se izvođaču tek pošto odsvira.
- ✈️ **Logistika za dijasporu** — za gaže u inostranstvu platforma sređuje prevoz, smeštaj i prijavu rada.

### Ključne funkcije
- 🔎 **Pretraga izvođača** — filteri po žanru, gradu, datumu (slobodni termini) i budžetu.
- 🎤 **Profili izvođača** — cenovnik, tagovi, utisci, YouTube nastup, generisana naslovna grafika.
- 📨 **Tok rezervacije** sa escrow stepper-om: `Upit → Potvrda → Kapara u escrow → Svirka → Isplata`.
- 🎛️ **Menadžerski panel** — KPI, roster, **jedinstven inbox** svih upita (Balkan/Dijaspora + filteri po statusu).
- 🔁 **Petlja obe strane** — prihvati/odbij/predloži izmenu; promena statusa se vidi kod oba korisnika.
- ⭐ **Utisci** — posle završene gaže; prosečna ocena se automatski preračunava (DB trigger).
- 🗓️ **Upravljanje rosterom** — dodavanje/izmena izvođača + kalendar slobodnih termina.
- 🌍 **Lokalizacija** — srpski / engleski / nemački (prebacivač u headeru).
- 🔐 **Auth** — mejl+lozinka, telefon OTP (dev-stub), Google OAuth.

## 🧱 Tech stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Stil | Tailwind CSS (custom dizajn-sistem) |
| Baza / Auth / Storage | Supabase (Postgres + RLS) |
| Hosting | Vercel |
| i18n | Tipizirani rečnici (sr / en / de) |

## 🚀 Živi demo

**https://gaza-marketplace-ruddy.vercel.app**

Demo nalozi (lozinka za sve: `demo1234`):

| Rola | Mejl | Šta vidi |
|------|------|----------|
| Naručilac | `marko@gaza.rs` | pretraga, upiti, escrow, utisci |
| Naručilac | `ana@gaza.rs` | dodatni upiti |
| Menadžer | `nenad@gaza.rs` | panel, inbox, roster, kalendar |

## 📸 Screenshots

<!-- Dodaj slike u docs/screenshots/ pa otkomentariši:
| Pretraga | Profil izvođača | Menadžerski inbox |
|---|---|---|
| ![Pretraga](docs/screenshots/pretraga.png) | ![Profil](docs/screenshots/profil.png) | ![Panel](docs/screenshots/panel.png) |
-->
> _Uskoro._ Slike idu u `docs/screenshots/` (ili prevuci fajl u GitHub issue da dobiješ URL, pa ubaci ovde).

## 🛠️ Lokalno pokretanje

**Preduslovi:** Node 18+ i Docker (za lokalni Supabase).

```bash
npm install
npx supabase start      # Postgres + Auth (prvi put povlači Docker slike)
npx supabase db reset   # šema (migracije) + demo podaci (seed)
npm run dev             # -> http://localhost:3000
```

Ako `dev` javi grešku sa ključevima: `npx supabase status` → prekopiraj `anon`/`service_role` u `.env.local` (vidi `.env.example`).

## ☁️ Deploy (Vercel + Supabase Cloud)

<details>
<summary>Koraci (klikni)</summary>

1. **Supabase Cloud** projekat → `npx supabase link --project-ref <ref>` → `npx supabase db push`; seed nalepi u SQL Editor.
2. **Vercel** → import repo → env varijable:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
3. **Supabase → Authentication → URL Configuration**: Site URL + Redirect URLs = tvoj domen (`/auth/callback`).
4. (opciono) **Google OAuth**: Providers → Google (client id/secret) + Google Console redirect `https://<ref>.supabase.co/auth/v1/callback`.

</details>

## 🗺️ Roadmap

- [ ] Pravi payment/escrow (Stripe Connect / regionalni PSP) — interfejs `PaymentProvider` je spreman
- [ ] Pravi SMS (Twilio) za telefon OTP
- [ ] Upload slika/video (Supabase Storage)
- [ ] E-mail notifikacije na promenu statusa
- [ ] E2E testovi (state-machine + RLS)

## 📂 Struktura

```
src/
  app/          # rute (landing, auth, pretraga, izvodjac, moji-upiti, panel)
  components/   # deljene UI komponente (Header, EscrowStepper, ArtistCover, ui/*)
  features/     # auth / organizer / manager (forme + server actions)
  i18n/         # rečnici sr/en/de + provider
  lib/          # supabase klijenti, db upiti, booking state-machine, payments, pricing
supabase/
  migrations/   # šema + RLS + trigeri
  seed.sql      # demo podaci
```

---

<div align="center">
<sub>Napravljeno kao MVP — Balkan &amp; dijaspora · EUR</sub>
</div>
