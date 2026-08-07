---
name: add-tags
description: Choose or add tags for a blog post, video, talk, book, or podcast episode without creating a near-duplicate of a tag that already exists. Use when asked to tag new content, pick tags for something, or audit/clean up tags across the site. Every unique tag in a content pool becomes a clickable filter button, so casing drift ("sql" vs "SQL") or synonyms ("Technical Writing" vs "Writing") silently fragment that filter sidebar.
---

# Adding tags

Tags are freeform strings (`tags: string[]`, schema in `src/content.config.ts`,
default `[]`). There is no fixed enum enforcing them — the only thing keeping
the tag list clean is checking the existing inventory before typing a new one.
`ContentFilter.astro` turns every *unique* string in a page's tag pool into a
sidebar filter button, so a near-duplicate doesn't just look messy in the
YAML — it shows up as a second, mostly-empty button next to the real one.

## 1. Pull the current inventory before picking a tag

Tags live in five independent pools, matching the five filter sidebars:

| Pool | Source | Page |
|---|---|---|
| blogs | `content/blogs/*.md` frontmatter | `blog.astro` |
| videos | `content/videos.yml` | `videos.astro` |
| talks | `content/talks.yml` | `talks.astro` |
| books | `content/books.yml` | `books.astro` |
| podcasts | `content/data_hustle_podcast.yml` + `guest_appearances.yml` + `sql_lingua_franca.yml` (combined) | `podcasts.astro` |

Run this before adding a tag, to see what already exists in every pool (tags
are written both inline `[a, b]` and as block lists, so parse with `yaml`
rather than grepping):

```bash
node -e "
const { readFileSync, readdirSync } = require('fs');
const { parse } = require('yaml');
const pools = {
  blogs: () => readdirSync('content/blogs').filter(f => f.endsWith('.md')).flatMap(f => {
    const m = readFileSync('content/blogs/'+f,'utf8').match(/^---\n([\s\S]*?)\n---/);
    return m ? (parse(m[1]).tags || []) : [];
  }),
  videos: () => parse(readFileSync('content/videos.yml','utf8')).videos.flatMap(v => v.tags || []),
  talks: () => parse(readFileSync('content/talks.yml','utf8')).talks.flatMap(t => t.tags || []),
  books: () => parse(readFileSync('content/books.yml','utf8')).books.flatMap(b => b.tags || []),
  podcasts: () => ['guest_appearances','sql_lingua_franca','data_hustle_podcast'].flatMap(k =>
    parse(readFileSync('content/'+k+'.yml','utf8'))[k].flatMap(p => p.tags || [])),
};
for (const [name, fn] of Object.entries(pools)) {
  const unique = [...new Set(fn())].sort();
  console.log(name + ':', unique.join(', '));
}
"
```

Even though enforcement (the filter buttons) is per-pool, treat the tag
*vocabulary* as site-wide when picking a string — "Data Strategy", "Career
Development", "dbt" etc. are already reused consistently across pools, and
that consistency is what makes cross-content browsing coherent.

## 2. Reuse before creating

Match case-insensitively and watch for singular/plural and synonym variants
(e.g. "SQL" vs "sql", "AsciiDoc" vs "asciidocs", "Technical Writing" vs
"Writing"). If an existing tag already covers the concept, use its exact
string — don't add a second spelling. If two tags on one item would overlap
too much to both be useful, drop the narrower one rather than keeping both.

## 3. Casing convention

Established by the July 2026 tag audit (`git show 78b6662`):

- Default to Title Case: `Career Development`, `Business Intelligence`, `Data Strategy`.
- Products and language names keep their natural casing: `SQL`, `R`, `Power BI`, `Power Query`, `Tableau`, `Snowflake`, `Alteryx`.
- `dbt` is always lowercase — brand convention, not a casing miss.
- Spell concepts out rather than abbreviating unless an abbreviation is already established in the inventory (e.g. the site uses `Artificial Intelligence`, not `AI`).

## 4. Don't over-tag

Existing content mostly carries 1–3 tags per item (videos average ~2, talks
~2.5). Keep new items in that range. Before inventing a brand-new tag, check
whether it would ever apply to more than this one item — if not, it's
probably better covered by an existing broader tag (this is why the audit
commit dropped `devops` from `writeops-manifesto.md`: `Technical Writing` and
`WriteOps` already covered it).

## 5. Where the tag goes

- Blog post: `tags: [...]` in the frontmatter of `content/blogs/<slug>.md`.
- Video/talk/book/podcast episode: `tags:` list on that item in the relevant
  `content/*.yml` file — block or flow style, both parse fine.

No code changes needed — `ContentFilter.astro` derives its buttons from
whatever tags exist in the collection at build time.

## 6. Periodic audit

Re-run the inventory command from step 1 occasionally across all five pools
and scan for casing drift or synonyms that crept in. Fix them in one pass the
same way the July 2026 audit did — same tag, matched string, one commit.
