-- Link ka YouTube kanalu/snimku nastupa (da naručioci pogledaju bend uživo).
alter table artists add column if not exists youtube_url text;
