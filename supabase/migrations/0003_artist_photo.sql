-- Opciona naslovna slika izvođača (URL). Upload binarnih fajlova (Storage) je M7+.
alter table artists add column if not exists photo_url text;
