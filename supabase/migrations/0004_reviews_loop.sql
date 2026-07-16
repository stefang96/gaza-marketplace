-- Reviews loop: tie a review to its booking (one per gig) and auto-recompute
-- the artist's aggregate rating via a trigger (runs as definer, so organizers
-- don't need write access to `artists`).

alter table reviews add column if not exists booking_id uuid references booking_requests (id) on delete set null;
create unique index if not exists reviews_booking_unique on reviews (booking_id) where booking_id is not null;

create or replace function public.recompute_artist_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.artist_id, old.artist_id);
begin
  update artists a
  set
    rating_avg = coalesce((select round(avg(rating)::numeric, 1) from reviews r where r.artist_id = target), 0),
    rating_count = (select count(*) from reviews r where r.artist_id = target)
  where a.id = target;
  return null;
end;
$$;

drop trigger if exists on_review_change on reviews;
create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute function public.recompute_artist_rating();
