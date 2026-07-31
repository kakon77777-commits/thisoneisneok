# Neo.K × EveMissLab

Neo.K's personal site: a bilingual Markdown-first blog, small experimental applications, the MSSP field lab, Lean4 formalization, and selected books.

Canonical production origin: `https://thisoneisneok.com`

## Main routes

- `/` — personal entrance and selected work
- `/apps` — experimental application catalog
- `/mssp` — MSSP field lab (the site's primary long-term axis)
- `/lean4` — formalization projects and companion papers
- `/blog` — bilingual personal log
- `/about` — author and organization

The wider network is reached through `https://evemiss.com/` (main navigation) and `https://evemisslab.com/`. Nothing from those sites is duplicated here.

## Catalog policy

`app/data/catalog.ts` holds `applications` and `leanProjects`. Both were cleared on 2026-07-31. An entry is added only when the project is real and reachable — a working link, a version, and an update date. Empty sections render an honest `PendingPanel` rather than placeholder cards.

## Add a blog entry

Create one or both files:

```text
content/blog/{slug}.zh.md
content/blog/{slug}.en.md
```

Then run:

```bash
npm run content:build
```

This produces:

- the website article data;
- raw Markdown under `public/md/blog/`;
- standalone reading HTML under `public/html/blog/`;
- printable PDFs under `public/pdf/blog/`;
- RSS, sitemap, and AI-readable indexes.

## Build

```bash
npm run build
```

The regular production build always refreshes Markdown indexes and standalone HTML. PDF rendering is intentionally available as a separate content step so its embedded Traditional Chinese font remains deterministic.
