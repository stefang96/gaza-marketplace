-- Gaža — demo seed (spec §4). Pokreće se pri `supabase db reset`.
-- Demo nalozi (lozinka za sve: demo1234):
--   nenad@gaza.rs   — MENADŽER (Kovač Management, 5 izvođača)
--   marko@gaza.rs   — NARUČILAC
--   ana@gaza.rs     — NARUČILAC
-- Telefon (dev OTP 123456): +381600000001 (menadžer), +381600000002 (naručilac)

-- ---------- Auth korisnici ----------
-- Trigger handle_new_user() automatski pravi profiles red iz raw_user_meta_data.
insert into auth.users
  (instance_id, id, aud, role, email, phone, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'nenad@gaza.rs', '+381600000001',
   crypt('demo1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"MANAGER","name":"Nenad Kovač","avatarColor":"#5A4BE3"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'marko@gaza.rs', '+381600000002',
   crypt('demo1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"ORGANIZER","name":"Marko Marković","avatarColor":"#3B62D6"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'ana@gaza.rs', null,
   crypt('demo1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"ORGANIZER","name":"Ana Jovanović","avatarColor":"#16A46E"}',
   now(), now(), '', '', '', '');

-- Email identiteti (potrebno za prijavu lozinkom u GoTrue).
insert into auth.identities
  (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '{"sub":"00000000-0000-0000-0000-000000000001","email":"nenad@gaza.rs"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   '{"sub":"00000000-0000-0000-0000-000000000002","email":"marko@gaza.rs"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
   '{"sub":"00000000-0000-0000-0000-000000000003","email":"ana@gaza.rs"}', 'email', now(), now(), now());

-- ---------- Izvođači ----------
-- Kovač Management (manager_id = Nenad).
insert into artists (id, manager_id, owner_user_id, name, kind, genre, city, bio, tags, price_from, rating_avg, rating_count, verified)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', null,
   'Milica Stefanović', 'Narodna pevačica', 'NAROD', 'Beograd',
   'Vrhunska interpretacija starogradske i narodne muzike. Svadbe, slave, proslave — u zemlji i dijaspori.',
   '{"Starogradska","Narodna","Svadbe","Slave"}', 900, 4.9, 47, true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', null,
   'Orkestar Braće Nikolić', 'Trubači · 8 članova', 'TRUBACI', 'Čačak',
   'Autentična truba iz srca Srbije. Energija za svadbe, slave i vesela okupljanja.',
   '{"Truba","Kolo","Svadbe","Guča"}', 1200, 4.8, 63, true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', null,
   'DJ Vuk', 'DJ', 'DJ', 'Beograd',
   'Balkan hitovi, house i party set. Klupska veča, proslave i privatne žurke.',
   '{"House","Balkan","Klub","Party"}', 500, 4.7, 31, true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', null,
   'Voltaža', 'Cover bend · 6 članova', 'COVER', 'Novi Sad',
   'Ex-Yu i svetski hitovi uživo. Bend koji diže svadbe i korporativne proslave.',
   '{"Cover","Ex-Yu","Rock","Svadbe"}', 1400, 4.8, 28, true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', null,
   'Tijana Marić', 'Pop-folk pevačica', 'POPFOLK', 'Beograd',
   'Savremeni pop-folk repertoar. Splavovi, klubovi i proslave.',
   '{"Pop-folk","Splav","Klub"}', 800, 4.6, 19, false);

-- Nezavisni izvođači (za pretragu).
insert into artists (id, manager_id, owner_user_id, name, kind, genre, city, bio, tags, price_from, rating_avg, rating_count, verified)
values
  ('10000000-0000-0000-0000-000000000006', null, null,
   'Tamburaški orkestar „Bačka“', 'Tamburaši · 5 članova', 'TAMBURASI', 'Novi Sad',
   'Vojvođanski tamburaški zvuk. Svadbe, slave i kamerne proslave.',
   '{"Tambure","Vojvodina","Svadbe"}', 1000, 4.9, 52, true),
  ('10000000-0000-0000-0000-000000000007', null, null,
   'Get Lucky Band', 'Cover / party bend', 'COVER', 'Beograd',
   'Funk, disco i party klasici uživo. Korporativni događaji i svadbe.',
   '{"Funk","Disco","Party","Korporativno"}', 1600, 4.7, 22, true),
  ('10000000-0000-0000-0000-000000000008', null, null,
   'Nocturno', 'Sax & DJ', 'DJ', 'Niš',
   'Spoj saksofona i DJ seta. Elegantne proslave, koktel i klub.',
   '{"Sax","DJ","Lounge","Koktel"}', 700, 4.5, 14, false);

-- YouTube linkovi (snimci nastupa) — demo.
update artists set youtube_url = 'https://www.youtube.com/@GusanjeTruba'
  where id = '10000000-0000-0000-0000-000000000002';
update artists set youtube_url = 'https://www.youtube.com/results?search_query=narodna+muzika+uzivo'
  where id = '10000000-0000-0000-0000-000000000001';
update artists set youtube_url = 'https://www.youtube.com/results?search_query=cover+bend+svadba'
  where id = '10000000-0000-0000-0000-000000000004';
update artists set youtube_url = 'https://www.youtube.com/results?search_query=tamburasi+uzivo'
  where id = '10000000-0000-0000-0000-000000000006';

-- ---------- Slobodni termini ----------
insert into availability (artist_id, date, status) values
  ('10000000-0000-0000-0000-000000000001', '2026-07-25', 'FREE'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-08', 'FREE'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-15', 'BOOKED'),
  ('10000000-0000-0000-0000-000000000002', '2026-07-19', 'FREE'),
  ('10000000-0000-0000-0000-000000000002', '2026-08-22', 'FREE'),
  ('10000000-0000-0000-0000-000000000003', '2026-07-26', 'FREE'),
  ('10000000-0000-0000-0000-000000000004', '2026-09-12', 'FREE'),
  ('10000000-0000-0000-0000-000000000005', '2026-08-30', 'FREE'),
  ('10000000-0000-0000-0000-000000000006', '2026-07-18', 'FREE'),
  ('10000000-0000-0000-0000-000000000007', '2026-09-05', 'FREE'),
  ('10000000-0000-0000-0000-000000000008', '2026-08-01', 'FREE');

-- ---------- Utisci ----------
insert into reviews (artist_id, organizer_name, event_label, rating, text) values
  ('10000000-0000-0000-0000-000000000001', 'Porodica Petrović', 'Svadba · Beograd', 5,
   'Milica je oduševila sve goste. Sve preporuke, escrow je radio bez problema.'),
  ('10000000-0000-0000-0000-000000000001', 'Slava Nikolić', 'Slava · Beč', 5,
   'Došla čak u Beč, logistiku su sredili oni. Vrhunski.'),
  ('10000000-0000-0000-0000-000000000002', 'Restoran „Stara vodenica“', 'Proslava · Čačak', 5,
   'Truba je digla ceo lokal. Dolaze ponovo.'),
  ('10000000-0000-0000-0000-000000000002', 'Marko M.', 'Svadba · Malme', 4,
   'Odlična atmosfera, malo kasnili sa dolaskom ali su nadoknadili.'),
  ('10000000-0000-0000-0000-000000000004', 'Korporacija DTX', 'Godišnjica · Novi Sad', 5,
   'Voltaža je profesionalna od početka do kraja.'),
  ('10000000-0000-0000-0000-000000000006', 'Svadba Kovačević', 'Svadba · Subotica', 5,
   'Tambure su bile tačka veče. Preporuka!');

-- ---------- Upiti (mix statusa, domaći + dijaspora) ----------
-- commission = 15% honorara; fee_total = fee_artist + logistics_fee + commission.
insert into booking_requests
  (artist_id, organizer_user_id, market, event_type, city, country, date, guests, message,
   fee_artist, logistics_fee, commission, fee_total, status, escrow_state,
   logistics_transport, logistics_stay, logistics_papers, created_at)
values
  -- NEW (domaći)
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002',
   'DOMESTIC', 'Klupsko veče', 'Skoplje', 'Severna Makedonija', '2026-07-26', 250,
   'Petak veče u klubu, treba nam DJ set od 23h do 3h.',
   600, 0, 90, 690, 'NEW', 'NONE', null, null, null, now() - interval '2 hours'),

  -- PENDING_CONFIRM (domaći, splav)
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   'DOMESTIC', 'Klupsko veče', 'Beograd', 'Srbija', '2026-08-30', 300,
   'Splav na Adi, subota. Dva seta po sat i po.',
   800, 0, 120, 920, 'PENDING_CONFIRM', 'NONE', null, null, null, now() - interval '1 day'),

  -- CONFIRMED, čeka uplatu kapare (demo dugmeta „Uplati kaparu“)
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'DOMESTIC', 'Svadba', 'Novi Sad', 'Srbija', '2026-08-15', 180,
   'Svadba u sali „Dunav“, potreban ceo večernji program.',
   1200, 0, 180, 1380, 'CONFIRMED', 'NONE', null, null, null, now() - interval '5 days'),

  -- CONFIRMED + escrow (DIJASPORA Beč)
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'DIASPORA', 'Svadba', 'Beč', 'Austrija', '2026-09-18', 180,
   'Svadba za ex-Yu zajednicu u Beču. Potrebna kompletna logistika.',
   2000, 600, 300, 2900, 'CONFIRMED', 'DEPOSIT_HELD',
   'Kombi prevoz Beograd–Beč (povratno)', 'Hotel 3* — 2 noćenja za 6 osoba',
   'Prijava rada (A1) i ugovor o nastupu', now() - interval '7 days'),

  -- PENDING_CONFIRM (DIJASPORA Frankfurt)
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   'DIASPORA', 'Proslava', 'Frankfurt', 'Nemačka', '2026-10-10', 220,
   'Velika proslava, potrebna pevačica + prateći bend. Logistiku očekujemo od vas.',
   1800, 500, 270, 2570, 'PENDING_CONFIRM', 'NONE',
   'Avio + lokalni transfer', 'Apartman — 2 noćenja', 'Prijava rada (A1)', now() - interval '3 days'),

  -- DECLINED (domaći svadba)
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
   'DOMESTIC', 'Svadba', 'Banja Luka', 'BiH', '2026-09-05', 200,
   'Svadba, ali termin nam je fleksibilan.',
   1400, 0, 210, 1610, 'DECLINED', 'NONE', null, null, null, now() - interval '10 days'),

  -- COMPLETED + released (DIJASPORA Malme)
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'DIASPORA', 'Svadba', 'Malme', 'Švedska', '2026-06-14', 160,
   'Svadba u Malmeu, truba za ceo dan.',
   2400, 800, 360, 3560, 'COMPLETED', 'RELEASED',
   'Kombi + trajekt', 'Hotel — 3 noćenja za 8 osoba', 'Prijava rada + ugovor',
   now() - interval '40 days'),

  -- CANCELLED + refunded (domaći rođendan)
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
   'DOMESTIC', 'Rođendan', 'Beograd', 'Srbija', '2026-08-01', 80,
   'Rođendanska žurka, otkazano zbog promene termina.',
   500, 0, 75, 575, 'CANCELLED', 'REFUNDED', null, null, null, now() - interval '15 days');
