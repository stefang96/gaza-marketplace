-- Gaža — inicijalna šema (spec §4)
-- Konvencija: snake_case u bazi; TS sloj mapira u camelCase.

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type user_role as enum ('ARTIST', 'MANAGER', 'ORGANIZER');
create type genre as enum ('NAROD', 'TRUBACI', 'COVER', 'DJ', 'POPFOLK', 'TAMBURASI');
create type market as enum ('DOMESTIC', 'DIASPORA');
create type availability_status as enum ('FREE', 'HELD', 'BOOKED');
create type booking_status as enum ('NEW', 'PENDING_CONFIRM', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED');
create type escrow_state as enum ('NONE', 'DEPOSIT_HELD', 'RELEASED', 'REFUNDED');

-- ---------- profiles (mirror of auth.users) ----------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         user_role not null default 'ORGANIZER',
  name         text not null default 'Korisnik',
  email        text,
  phone        text,
  google_id    text,
  avatar_color text not null default '#5A4BE3',
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row whenever an auth user is created, pulling fields
-- from the signup metadata (role/name/avatarColor set by our auth actions).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email, phone, avatar_color)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'ORGANIZER'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'korisnik'), '@', 1)),
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'avatarColor', '#5A4BE3')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- artists ----------
create table artists (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid references profiles (id) on delete set null,
  manager_id    uuid references profiles (id) on delete set null,
  name          text not null,
  kind          text not null,
  genre         genre not null,
  city          text not null,
  bio           text not null default '',
  tags          text[] not null default '{}',
  price_from    integer not null default 0,
  rating_avg    numeric(2,1) not null default 0,
  rating_count  integer not null default 0,
  verified      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index artists_manager_idx on artists (manager_id);
create index artists_genre_idx on artists (genre);
create index artists_city_idx on artists (city);

-- ---------- availability ----------
create table availability (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references artists (id) on delete cascade,
  date       date not null,
  status     availability_status not null default 'FREE',
  unique (artist_id, date)
);

-- ---------- booking_requests ----------
create table booking_requests (
  id                  uuid primary key default gen_random_uuid(),
  artist_id           uuid not null references artists (id) on delete cascade,
  organizer_user_id   uuid not null references profiles (id) on delete cascade,
  market              market not null,
  event_type          text not null,
  city                text not null,
  country             text not null default 'Srbija',
  date                date not null,
  guests              integer not null default 0,
  message             text not null default '',
  fee_artist          integer not null default 0,
  logistics_fee       integer not null default 0,
  commission          integer not null default 0,   -- 15% od honorara
  fee_total           integer not null default 0,
  status              booking_status not null default 'NEW',
  escrow_state        escrow_state not null default 'NONE',
  logistics_transport text,
  logistics_stay      text,
  logistics_papers    text,
  created_at          timestamptz not null default now()
);
create index bookings_artist_idx on booking_requests (artist_id);
create index bookings_organizer_idx on booking_requests (organizer_user_id);

-- ---------- reviews ----------
create table reviews (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references artists (id) on delete cascade,
  organizer_name text not null,
  event_label    text not null,
  rating         integer not null check (rating between 1 and 5),
  text           text not null default '',
  created_at     timestamptz not null default now()
);
create index reviews_artist_idx on reviews (artist_id);

-- ---------- Helper: does the current user control this artist? ----------
create or replace function public.controls_artist(a_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from artists a
    where a.id = a_id
      and (a.manager_id = auth.uid() or a.owner_user_id = auth.uid())
  );
$$;

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table artists enable row level security;
alter table availability enable row level security;
alter table booking_requests enable row level security;
alter table reviews enable row level security;

-- profiles: authenticated users may read basic profiles (names shown in inbox /
-- booking detail); users may update only their own row.
create policy "profiles readable by authenticated"
  on profiles for select to authenticated using (true);
create policy "profiles update own"
  on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- artists: public catalog (search works logged-out too); managed by owner/manager.
create policy "artists public read"
  on artists for select using (true);
create policy "artists insert by owner/manager"
  on artists for insert to authenticated
  with check (manager_id = auth.uid() or owner_user_id = auth.uid());
create policy "artists update by owner/manager"
  on artists for update to authenticated
  using (manager_id = auth.uid() or owner_user_id = auth.uid())
  with check (manager_id = auth.uid() or owner_user_id = auth.uid());

-- availability: public read; write by controller.
create policy "availability public read"
  on availability for select using (true);
create policy "availability write by controller"
  on availability for all to authenticated
  using (public.controls_artist(artist_id))
  with check (public.controls_artist(artist_id));

-- booking_requests: visible to the organizer who created it and to the
-- artist's owner/manager. Both sides can update (state machine enforced in app).
create policy "bookings select for parties"
  on booking_requests for select to authenticated
  using (organizer_user_id = auth.uid() or public.controls_artist(artist_id));
create policy "bookings insert by organizer"
  on booking_requests for insert to authenticated
  with check (organizer_user_id = auth.uid());
create policy "bookings update by parties"
  on booking_requests for update to authenticated
  using (organizer_user_id = auth.uid() or public.controls_artist(artist_id))
  with check (organizer_user_id = auth.uid() or public.controls_artist(artist_id));

-- reviews: public read; organizers may add.
create policy "reviews public read"
  on reviews for select using (true);
create policy "reviews insert by authenticated"
  on reviews for insert to authenticated with check (true);
