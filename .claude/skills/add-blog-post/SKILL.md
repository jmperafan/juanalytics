---
name: add-blog-post
description: Scaffold a new blog post on the site, or edit an existing one's frontmatter. Use when asked to write, add, draft, or publish a blog post/article. Handles the file location, the slug-from-filename convention, the exact frontmatter fields the schema requires, and where hero images live.
---

# Adding a blog post

## 1. File and slug

Create `content/blogs/<slug>.md`. The `blogs` collection uses Astro's `glob`
loader (`src/content.config.ts`), which derives the entry's `id` — and
therefore its URL, `/blog/<id>` via `src/pages/blog/[...slug].astro` —
directly from the **filename**, not from the title. Name the file exactly
what you want the URL slug to be: lowercase, hyphen-separated
(`why-asciidoc-is-better-than-markdown.md` → `/blog/why-asciidoc-is-better-than-markdown`).

This is different from the YAML-backed collections (videos, talks, etc.),
where the slug is auto-derived from `title` instead — see `add-media-entry`
if that's what you're adding.

## 2. Frontmatter

Schema (`src/content.config.ts`):

```yaml
---
title: 'Post Title'
description: 'One or two sentences — used for SEO and the blog listing card.'
pubDate: 2026-08-06
updatedDate: 2026-08-10   # optional, only add when you actually revise a published post
heroImage: '/images/logo_resized.webp'  # optional
tags: []                  # optional — see step 4
---
```

`pubDate`/`updatedDate` are `z.coerce.date()`, so either a quoted or bare
`YYYY-MM-DD` works — existing posts use bare dates for these two fields.

## 3. Hero image

Two existing patterns, pick based on whether the post has a real cover:

- Custom cover: drop a `.webp` in `public/blog/` and reference it as
  `/blog/<file>.webp` (matches `sql-for-data-analytics-cover.webp`, etc.).
- No custom cover: reuse `/images/logo_resized.webp`, or omit `heroImage`
  entirely — both are used on existing posts.

Path is always root-relative into `public/` — never prefix it with `/public/`.

## 4. Tags

Run the `add-tags` skill before writing the `tags` array — it checks the
site's existing tag vocabulary so this post reuses a tag like `SQL` or
`Career Development` instead of creating a near-duplicate.

## 5. Verify

`npm run dev`, then check `/blog` (card shows up, tags filter correctly) and
`/blog/<slug>` (renders, reading time looks right). Markdown/frontmatter
edits don't trigger `astro check` in the pre-commit hook (it only runs for
staged `.ts`/`.astro`/`.mjs`), so this is the only real check before commit.
