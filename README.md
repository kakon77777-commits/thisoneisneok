# Neo.K × EveMissLab

The unified personal site for Neo.K, EveMissLab applications, the MSSP field lab, Lean4 formalization, selected books, and a bilingual Markdown-first blog.

Canonical production origin: `https://thisoneisneok.com`

## Main routes

- `/` — personal entrance and selected work
- `/apps` — application and experiment catalog
- `/mssp` — MSSP field lab
- `/lean4` — formalization projects and companion material
- `/blog` — bilingual personal log
- `/about` — author and organization

The complete theory corpus remains at `https://logic.evemisslab.com/` and is intentionally not duplicated here.

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
