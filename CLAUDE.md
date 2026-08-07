# juanalytics

Juan Manuel Perafan's personal portfolio and blog: Astro 5 + TypeScript,
static-generated, deployed to GitHub Pages at [juanalytics.com](https://juanalytics.com).
Node version is pinned in `.nvmrc` (20.19.5).

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | `astro check` + production build to `./dist/` |
| `npm run test:run` | Vitest unit tests, once |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run fetch:podcasts` | Manually run the Data Hustle episode fetcher |

## Content model

Content lives in `content/` at the repo root, **not** `src/content/`. Every
collection is registered in `src/content.config.ts`:

- `content/blogs/*.md` — blog posts (Astro `glob` loader; filename = slug)
- `content/videos.yml`, `talks.yml`, `books.yml` — one YAML list each
- `content/data_hustle_podcast.yml`, `sql_lingua_franca.yml`, `guest_appearances.yml` — the three podcast sources, kept separate so pages can address each show, but pooled together on `/podcasts`
- `content/experience.yml` — work history for the About timeline

YAML-backed items get their `id` auto-derived from `title` (not from
filename); blog posts get theirs from the `.md` filename directly.

**Use the `add-blog-post` and `add-media-entry` skills** for adding any of
the above — they encode the exact schema fields, thumbnail conventions, and
slug rules so entries don't need a follow-up fix. **Use the `add-tags`
skill** before writing a `tags` array on anything — tags are freeform
strings that become filter-sidebar buttons, so casing drift or synonyms
silently fragment that filter instead of erroring.

## Design

Dark theme, blue/purple accent, Inter typeface — tokens in
`src/styles/global.css` (`--color-primary: #2563eb`, `--color-bg: #0f172a`,
etc.). This is a deliberate, settled look: **refine within it, don't
propose a redesign.**

## Git hooks (Husky)

- `pre-commit`: runs `astro check` only if staged files include
  `.ts`/`.astro`/`.mjs` — pure content edits (`.md`, `.yml`) commit without
  it.
- `pre-push`: runs `npm run test:run` (unit tests only; E2E runs in CI, not
  here — it's slow).

## Deploy & automation

Pushing to `main` runs the full pipeline unattended: unit tests → build →
Playwright E2E → deploy to GitHub Pages (`.github/workflows/deploy.yml`).
There's no staging environment or manual approval step, so treat `main` as
production.

Separately, `.github/workflows/check-podcast-episodes.yml` runs weekly
(Mondays 13:00 UTC), fetches new Data Hustle episodes via
`scripts/fetch-podcast-episodes.mjs`, and **commits+pushes straight to
`main`** if it finds any — no PR, no human review. This is intentional
(routine content, not code), so don't add a review gate here unless asked.

## Testing

Unit tests (Vitest) live next to what they test, in `__tests__/` (e.g.
`src/utils/__tests__/readingTime.test.ts`). E2E tests (Playwright) live in
`tests/e2e/`, one spec file per page/flow.
