"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import type { Genre } from "@/lib/types";

export interface ArtistFormState {
  ok: boolean;
  error?: string;
}

const GENRES: Genre[] = ["NAROD", "TRUBACI", "COVER", "DJ", "POPFOLK", "TAMBURASI"];

function parseArtistForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  const genreRaw = String(formData.get("genre") ?? "COVER");
  const genre = (GENRES.includes(genreRaw as Genre) ? genreRaw : "COVER") as Genre;
  const city = String(formData.get("city") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const priceFrom = Math.max(0, parseInt(String(formData.get("priceFrom") ?? "0"), 10) || 0);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const youtubeUrl = String(formData.get("youtube") ?? "").trim() || null;
  const photoUrl = String(formData.get("photo") ?? "").trim() || null;
  return { name, kind, genre, city, bio, priceFrom, tags, youtubeUrl, photoUrl };
}

export async function createArtist(
  _prev: ArtistFormState,
  formData: FormData,
): Promise<ArtistFormState> {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role === "ORGANIZER") return { ok: false, error: t.errors.notAllowed };

  const f = parseArtistForm(formData);
  if (!f.name || !f.kind) return { ok: false, error: t.manage.errName };

  const supabase = await createClient();
  const { error } = await supabase.from("artists").insert({
    manager_id: user.id,
    name: f.name,
    kind: f.kind,
    genre: f.genre,
    city: f.city || "Beograd",
    bio: f.bio,
    tags: f.tags,
    price_from: f.priceFrom,
    youtube_url: f.youtubeUrl,
    photo_url: f.photoUrl,
    verified: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/panel/izvodjaci");
  revalidatePath("/panel");
  redirect("/panel/izvodjaci");
}

async function assertControls(artistId: string) {
  const user = await getSessionUser();
  const { t } = await getT();
  if (!user || user.role === "ORGANIZER") return { error: t.errors.notAllowed, supabase: null };
  const supabase = await createClient();
  const { data } = await supabase
    .from("artists")
    .select("id")
    .eq("id", artistId)
    .maybeSingle();
  if (!data) return { error: t.errors.notFound, supabase: null };
  return { error: null, supabase };
}

export async function updateArtist(
  artistId: string,
  _prev: ArtistFormState,
  formData: FormData,
): Promise<ArtistFormState> {
  const { error, supabase } = await assertControls(artistId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };

  const f = parseArtistForm(formData);
  if (!f.name || !f.kind) return { ok: false, error: t.manage.errName };

  const { error: updErr } = await supabase
    .from("artists")
    .update({
      name: f.name,
      kind: f.kind,
      genre: f.genre,
      city: f.city,
      bio: f.bio,
      tags: f.tags,
      price_from: f.priceFrom,
      youtube_url: f.youtubeUrl,
      photo_url: f.photoUrl,
    })
    .eq("id", artistId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath(`/izvodjac/${artistId}`);
  revalidatePath("/panel/izvodjaci");
  redirect("/panel/izvodjaci");
}

export async function addAvailability(
  artistId: string,
  date: string,
): Promise<ArtistFormState> {
  const { error, supabase } = await assertControls(artistId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };
  if (!date) return { ok: false, error: t.manage.errDate };

  // Upsert so re-adding an existing date doesn't error on the unique constraint.
  const { error: insErr } = await supabase
    .from("availability")
    .upsert({ artist_id: artistId, date, status: "FREE" }, { onConflict: "artist_id,date" });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath(`/panel/izvodjaci/${artistId}/izmena`);
  revalidatePath(`/izvodjac/${artistId}`);
  return { ok: true };
}

export async function removeAvailability(slotId: string, artistId: string): Promise<ArtistFormState> {
  const { error, supabase } = await assertControls(artistId);
  const { t } = await getT();
  if (error || !supabase) return { ok: false, error: error ?? t.errors.generic };

  const { error: delErr } = await supabase.from("availability").delete().eq("id", slotId);
  if (delErr) return { ok: false, error: delErr.message };

  revalidatePath(`/panel/izvodjaci/${artistId}/izmena`);
  revalidatePath(`/izvodjac/${artistId}`);
  return { ok: true };
}
