# Gaža 🎷

Marketplace koji povezuje muzičare i bendove sa naručiocima svirki — u zemlji i
u dijaspori. Dve ključne vrednosti: **zaštita plaćanja (escrow)** i **logistika
za dijasporu**.

> MVP za validaciju i prezentaciju. Escrow i plaćanja su **simulirani** (bez
> pravog PSP-a, bez kartičnih podataka).

## Tech stack

- **Next.js 15 (App Router) + TypeScript** — UI i serverska logika (server
  components, server actions, route handlers) u jednom.
- **Tailwind CSS** — dizajn tokeni iz specifikacije (§8).
- **Supabase** — Postgres baza, Auth (mejl+lozinka, telefon OTP, Google),
  Storage. Lokalno se diže preko Supabase CLI (Docker).
- Jezik: **srpski / engleski / nemački** (prebacivač u headeru, cookie
  `gaza_locale`) · Valuta: **EUR** · Datum: `dd.mm.yyyy.`

## Šta je urađeno (Milestones M1–M4)

- **M1** — Skafold, dizajn-sistem (tokeni, Bricolage Grotesque + Inter), layout
  shell (header sa navigacijom po roli, footer), landing.
- **M2** — Auth: registracija/prijava sa **mejl+lozinka**, **Google** i
  **telefon OTP** (dev-stub), izbor role (Izvođač/Menadžer vs Naručilac),
  zaštita ruta po roli (middleware).
- **M3** — Postgres šema (enums, `profiles` + trigger, `artists`,
  `availability`, `booking_requests`, `reviews`), RLS politike i **seed** demo
  podacima (Kovač Management + 5 izvođača, 3 nezavisna, mix upita domaći +
  dijaspora sa svim statusima).
- **M4** — Naručilac tok: **pretraga** sa uživo filterima (žanr/grad/datum/
  budžet + preklopnik privatno/klub), **profil izvođača** (cenovnik, tagovi,
  utisci, slobodni termini), **slanje upita** sa live procenom troška i escrow
  objašnjenjem, **Moji upiti** lista + **detalj** sa escrow stepper-om i
  simuliranim akcijama (uplati kaparu → potvrdi odsvirano → isplata / otkaži →
  refund).

- **M5** — Menadžerski panel `/panel`: KPI kartice, roster sa badge-om broja
  otvorenih upita, **jedinstven inbox** svih upita za sve izvođače sa filterima
  (Balkan/Dijaspora + status). Roster stranica `/panel/izvodjaci`. Detalj upita
  `/panel/upit/[id]`: verifikovan naručilac, razbijen honorar (izvođaču /
  logistika / provizija 15% / ukupno), logistika, escrow stepper.
- **M6** — Povezivanje obe strane: menadžer **prihvata** (→ Potvrđeno), **odbija**
  (→ refund ako je bilo kapare), **predlaže izmenu**, otvaranje NEW upita ga
  označava kao viđen (→ Čeka potvrdu), i može da potvrdi nastup (→ isplata).
  Promena statusa se **vidi kod oba korisnika** (isti red u bazi).

Dodatno: **YouTube „Pogledaj nastup"** link na profilu izvođača; forma upita ima
preklopnik **Balkan / Dijaspora** sa select-om države po tržištu.

**Lokalizacija (i18n):** ceo UI je preveden na **srpski, engleski i nemački**.
Jezik se bira u headeru i pamti u cookie-ju (`gaza_locale`); `<html lang>` se
menja u skladu. Rečnici su u [`src/i18n/dictionaries/`](src/i18n/dictionaries/)
(tipizirani — TypeScript prijavljuje svaki string koji nedostaje u nekom jeziku).
Seed sadržaj (imena bendova, biografije, gradovi) ostaje kako je unet.

- **M7** — Upravljanje rosterom: **„Dodaj izvođača"**, **izmena profila**
  (repertoar, tagovi, cenovnik, YouTube, naslovna slika-URL) i **kalendar
  slobodnih termina** (dodavanje/uklanjanje datuma). Rute
  `/panel/izvodjaci/novi` i `/panel/izvodjaci/[id]/izmena`.
- **Utisci (reviews)** — posle `COMPLETED` gaže naručilac ostavlja ocenu +
  komentar; DB trigger automatski preračunava prosečnu ocenu izvođača (radi pod
  RLS-om bez davanja write prava naručiocu). Jedan utisak po gaži.
- **Polish** — hamburger meni na telefonu, „Datum" filter sada zaista filtrira
  po slobodnim terminima, loading skeletoni (pretraga/panel/moji-upiti).

Sledeće (opciono): pravi upload slika/video (Supabase Storage), Twilio SMS +
Google OAuth, auto-detekcija jezika, E2E testovi, e-mail notifikacije.

> ⚠️ Nakon povlačenja ovih izmena pokreni **`npx supabase db reset`** — dodate su
> migracije `0003` (photo_url) i `0004` (reviews.booking_id + trigger za ocene).

## Pokretanje lokalno

### Preduslovi
- Node 18+ (testirano na 24)
- **Docker** (za lokalni Supabase)

### Koraci

```bash
# 1) Instaliraj zavisnosti
npm install

# 2) Digni lokalni Supabase (Postgres + Auth). Prvi put povlači Docker slike.
npx supabase start

# 3) Prekopiraj ključeve iz izlaza `supabase start` (ili `npx supabase status`)
#    u .env.local ako se razlikuju od podrazumevanih:
#      NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#    (.env.local već postoji sa podrazumevanim lokalnim vrednostima.)

# 4) Primeni šemu + seed
npx supabase db reset

# 5) Pokreni aplikaciju
npm run dev
# -> http://localhost:3000
```

Korisne adrese lokalnog Supabase-a: Studio `http://127.0.0.1:54323`,
Inbucket (mejlovi) `http://127.0.0.1:54324`.

## Demo nalozi (lozinka: `demo1234`)

| Rola | Mejl | Napomena |
|------|------|----------|
| Naručilac | `marko@gaza.rs` | ima upite u raznim statusima |
| Naručilac | `ana@gaza.rs` | dodatni upiti |
| Menadžer | `nenad@gaza.rs` | Kovač Management, 5 izvođača (panel u M5) |

## Demo tok (klikabilno)

1. **Prijavi se** kao `marko@gaza.rs`.
2. **Pretraga** → filtriraj (npr. žanr „Trubači“) → otvori profil izvođača.
3. **Pošalji upit** → izaberi „Dijaspora“ da vidiš logistiku + višu procenu →
   pošalji. Landing-uješ na detalj upita sa potvrdom i escrow stepper-om.
4. **Moji upiti** → otvori upit „Svadba · Novi Sad“ (status *Potvrđeno*) →
   **Uplati kaparu u escrow** → stepper pomera na „Kapara u escrow-u“.
5. Za završen ciklus: **Potvrdi da je odsvirano** → status *Završeno*, escrow
   *Isplaćeno*. Ili **Otkaži** → *Otkazano* + *Refundirano*.

**Petlja marketplace-a (obe strane):**
6. Odjavi se, prijavi kao menadžer `nenad@gaza.rs` → **Panel**.
7. Otvori upit sa statusom *Novo* → automatski postaje *Čeka potvrdu* →
   **Prihvati upit**.
8. Vrati se kao `marko@gaza.rs` → **Moji upiti**: isti upit je sada *Potvrđeno* i
   možeš da **uplatiš kaparu**. To je zaokružena petlja.

## Napomene o simulaciji i integracijama

- **Escrow / plaćanje** — `MockPaymentProvider` (u
  [`src/lib/payments.ts`](src/lib/payments.ts)) samo menja `escrow_state` i
  loguje. Interfejs `PaymentProvider` je granica za pravi PSP (Stripe Connect /
  regionalni) bez menjanja UI-a.
- **Telefon OTP** — UI i serverski tok su gotovi; koriste Supabase
  `signInWithOtp/verifyOtp`. Bez SMS provajdera, ova verzija Supabase CLI-ja
  onemogućava telefonsku prijavu. Za demo koristi **mejl** ili **Google**.
  TODO: zakačiti Twilio/Vonage (`[auth.sms.twilio]` u `supabase/config.toml`),
  ili demo test-brojeve iz `[auth.sms.test_otp]` uz noviji CLI.
- **Google OAuth** — dugme i callback (`/auth/callback`) su implementirani. Za
  rad lokalno dodaj Google client ID/secret u `[auth.external.google]` u
  `supabase/config.toml`.

## Struktura

```
src/
  app/                     # rute (landing, prijava/registracija, pretraga, izvodjac/[id], moji-upiti, panel)
  components/              # deljene UI komponente (Header, EscrowStepper, ui/*)
  features/
    auth/                  # auth forme + server actions
    organizer/             # pretraga, kartice, booking forma, akcije
  lib/
    supabase/              # klijenti (browser/server/middleware)
    db/                    # upiti + mapperi (snake_case -> camelCase)
    booking.ts             # state machine (status + escrow)
    payments.ts            # PaymentProvider interfejs + Mock
    pricing.ts             # honorar + provizija 15% + logistika
    constants.ts, types.ts # domenski tipovi i srpske labele
supabase/
  migrations/0001_init.sql # šema + RLS + trigger
  seed.sql                 # demo podaci
```

## Deploy (Vercel + Supabase Cloud) — besplatno

### 1) Supabase Cloud projekat
- Napravi projekat na [supabase.com](https://supabase.com) (Free plan).
- Iz **Project Settings → API** uzmi: `Project URL`, `anon` ključ, `service_role` ključ.

### 2) Primeni šemu + seed na cloud
```bash
npx supabase login
npx supabase link --project-ref <TVOJ-PROJECT-REF>
npx supabase db push          # primeni migracije (0001–0004)
```
Seed (demo podaci) se ne primenjuje automatski — otvori **Supabase → SQL Editor**,
nalepi sadržaj `supabase/seed.sql` i pokreni. (Opciono, samo za demo podatke.)

### 3) Vercel
- Uvezi GitHub repo `gaza-marketplace` na [vercel.com](https://vercel.com) (Hobby plan).
- Framework: **Next.js** (auto-detektovano).

### 4) Environment varijable na Vercel-u (Project → Settings → Environment Variables)
| Ime | Vrednost |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon ključ |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role ključ (server-only) |
| `NEXT_PUBLIC_SITE_URL` | `https://<tvoj-app>.vercel.app` |
| `NEXT_PUBLIC_DEV_OTP` | `123456` (opciono) |

### 5) Supabase Auth URL-ovi (za redirect posle prijave)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://<tvoj-app>.vercel.app`
- **Redirect URLs:** dodaj `https://<tvoj-app>.vercel.app/auth/callback`

### 6) Deploy
Vercel gradi automatski na svaki `git push` na `main`. Prvi build → dobijaš živi link.

### 7) (Opciono) Google OAuth u produkciji
Supabase → **Authentication → Providers → Google** (uključi + client_id/secret), a u
Google Console dodaj redirect `https://<ref>.supabase.co/auth/v1/callback`.

> Napomena: telefon OTP u produkciji traži pravi SMS provajder (Twilio); escrow/plaćanje
> ostaje simulirano dok se ne integriše PSP. Za demo koristi mejl prijavu.
