"use client";

import { useActionState } from "react";
import { createArtist, updateArtist, type ArtistFormState } from "./artistActions";
import { useT } from "@/i18n/provider";
import type { Artist, Genre } from "@/lib/types";

const EMPTY: ArtistFormState = { ok: false };
const GENRES: Genre[] = ["NAROD", "TRUBACI", "COVER", "DJ", "POPFOLK", "TAMBURASI"];

export function ArtistForm({ artist }: { artist?: Artist }) {
  const t = useT();
  const isEdit = !!artist;
  const action = isEdit ? updateArtist.bind(null, artist!.id) : createArtist;
  const [state, formAction, pending] = useActionState(action, EMPTY);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            {t.manage.name}
          </label>
          <input
            id="name"
            name="name"
            className="input"
            defaultValue={artist?.name}
            placeholder={t.manage.namePlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="kind">
            {t.manage.kind}
          </label>
          <input
            id="kind"
            name="kind"
            className="input"
            defaultValue={artist?.kind}
            placeholder={t.manage.kindPlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="genre">
            {t.manage.genre}
          </label>
          <select id="genre" name="genre" className="input" defaultValue={artist?.genre ?? "NAROD"}>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {t.genres[g]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="city">
            {t.manage.city}
          </label>
          <input
            id="city"
            name="city"
            className="input"
            defaultValue={artist?.city}
            placeholder={t.manage.cityPlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="priceFrom">
            {t.manage.priceFrom}
          </label>
          <input
            id="priceFrom"
            name="priceFrom"
            type="number"
            min={0}
            step={50}
            className="input"
            defaultValue={artist?.priceFrom ?? 0}
          />
        </div>
        <div>
          <label className="label" htmlFor="youtube">
            {t.manage.youtube}
          </label>
          <input
            id="youtube"
            name="youtube"
            className="input"
            defaultValue={artist?.youtubeUrl ?? ""}
            placeholder="https://youtube.com/…"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="photo">
          {t.manage.photo}
        </label>
        <input
          id="photo"
          name="photo"
          className="input"
          defaultValue={artist?.photoUrl ?? ""}
          placeholder="https://…/slika.jpg"
        />
      </div>

      <div>
        <label className="label" htmlFor="tags">
          {t.manage.tags}
        </label>
        <input
          id="tags"
          name="tags"
          className="input"
          defaultValue={artist?.tags.join(", ")}
          placeholder={t.manage.tagsPlaceholder}
        />
        <p className="mt-1 text-xs text-muted">{t.manage.tagsHint}</p>
      </div>

      <div>
        <label className="label" htmlFor="bio">
          {t.manage.bio}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          className="input"
          defaultValue={artist?.bio}
          placeholder={t.manage.bioPlaceholder}
        />
      </div>

      {state.error && <p className="text-sm text-coral">{state.error}</p>}

      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending
          ? isEdit
            ? t.manage.saving
            : t.manage.creating
          : isEdit
            ? t.manage.save
            : t.manage.create}
      </button>
    </form>
  );
}
