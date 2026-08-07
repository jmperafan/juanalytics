---
name: add-media-entry
description: Add a video, talk, book, or podcast episode (Data Hustle, SQL Lingua Franca, or a guest appearance) to the site. Use when asked to add/log a new video, talk, book, or podcast episode. Handles which YAML file it goes in, the exact fields each collection's schema requires, and the thumbnail conventions per type.
---

# Adding a video / talk / book / podcast entry

These five collections are plain YAML lists in `content/`, registered in
`src/content.config.ts`. Each item's `id` (used for React keys / dedup, not
routing) is auto-derived from `title` by the `yamlList()` loader — slugified,
with a numeric suffix if two titles collide. You never set an id by hand.

| Type | File | Key | Schema |
|---|---|---|---|
| Video | `content/videos.yml` | `videos` | `mediaSchema` + `platform` (default `youtube`) |
| Talk | `content/talks.yml` | `talks` | `mediaSchema` + `event`, `location`?, `url`? |
| Book | `content/books.yml` | `books` | `mediaSchema` + `publisher`?, `buttonText` (default `'View Book'`) |
| Data Hustle episode | `content/data_hustle_podcast.yml` | `data_hustle_podcast` | `podcastSchema` |
| SQL Lingua Franca episode | `content/sql_lingua_franca.yml` | `sql_lingua_franca` | `podcastSchema` |
| Guest appearance | `content/guest_appearances.yml` | `guest_appearances` | `podcastSchema` |

`mediaSchema` base fields: `url` (must be a valid URL — omit only where the
schema marks it optional, e.g. talks with no recording), `title`, `date`,
`description`, `duration`? (`MM:SS` or `H:MM:SS` string), `thumbnail`?,
`thumbnail_fit`? (`cover`/`contain`), `tags` (default `[]`).
`podcastSchema` adds `podcast`? (show name) and `episode`? (as a string,
even though it's a number, e.g. `episode: "9"`).

Data Hustle episodes are normally added automatically by the weekly
`check-podcast-episodes.yml` cron via `scripts/fetch-podcast-episodes.mjs` —
only add one by hand for a backfill or if the entry needs details the script
can't get from the YouTube feed.

## Where to insert it

Pages sort by `date` descending at render time
(`(await getCollection(...)).sort(byDateDesc)`), so **file order is cosmetic,
not functional** — appending anywhere in the list renders correctly. For
readability, put new entries near the top, but don't spend time re-sorting
the whole file.

## Thumbnails

- **Video / podcast with a YouTube URL**: `https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg`
  (fall back to `hqdefault.jpg` if maxres 404s — some older/low-res uploads
  don't have one). `<VIDEO_ID>` is the `v=` param or the path segment after `youtu.be/`.
- **Talk with no recording**: reuse the event's own promo image if you can
  find one (conference/meetup page OG image); otherwise generate a
  placeholder matching the site's dark theme:
  `https://placehold.co/600x400/1e293b/94a3b8?text=<Event+Name>`.
- **Book / local asset**: store under `public/images/books/` (or
  `public/images/thumbnails/` for talks) and reference it **root-relative
  without a `/public` prefix** — `/images/books/foo.jpg`, not
  `/public/images/books/foo.jpg`. `public/` is Astro's static root, so a
  `/public/...` path 404s once built. (`content/talks.yml` currently has two
  entries with this exact mistake — `big_data_expo_2022.jpg` and
  `nerd_nite_2017.jpeg` — worth fixing if you're touching that file anyway.)

## Tags

Run the `add-tags` skill before writing `tags` — the filter sidebar on
`/videos`, `/talks`, `/books`, and `/podcasts` (which pools Data Hustle,
SQL Lingua Franca, and guest appearances together) is built from whatever
unique strings show up here, so reuse the existing vocabulary rather than
inventing a near-duplicate.

## Verify

`npm run dev`, then check the relevant page: the card renders, the thumbnail
loads (broken image = wrong path or expired YouTube ID), and the tag filter
button behaves as expected.
