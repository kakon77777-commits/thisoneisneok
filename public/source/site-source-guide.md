# Neo.K × EveMissLab Source Guide

Canonical site: https://thisoneisneok.com/

Five content pipelines feed this site. Each one publishes a human-readable
surface and the source it was generated from, and each is rebuilt by
`npm run content:index`.

## Papers

Sources live in `ingest/01-before/<series>/`. Three published formats, one origin:

- Reading page: `https://thisoneisneok.com/html/papers/{id}.html`
- Printable PDF: `https://thisoneisneok.com/pdf/papers/{id}.pdf`
- Markdown source: `https://thisoneisneok.com/md/papers/{id}.md`
- Index: `https://thisoneisneok.com/ai/papers-index.json`

Notation is typeset with KaTeX at build time, so a published paper needs no
client-side JavaScript to render its mathematics. The build refuses to publish
if any math delimiter survives rendering.

## MSSP examples and field-manual modules

Sources live in `mssp/examples/<id>/` and `mssp/modules/`.

- Example page, including its full source: `https://thisoneisneok.com/html/mssp/{id}.html`
- Module page: `https://thisoneisneok.com/html/mssp/modules/{id}.html`
- Index: `https://thisoneisneok.com/ai/mssp-index.json`

Every example is checked at build time: it must run, no TMS may import a sibling
TMS, no set directory may be empty, and its README must state what the example
does not solve. A failing check blocks publication rather than adding a warning.

## Experimental applications

Curated in `experiments/manifest.json` from the archive in
`ingest/01-before/Apps/`. Iterations collapse to the latest version; the number
of iterations in a line is published alongside it.

- Application: `https://thisoneisneok.com/experiments/{slug}.html`
- Index: `https://thisoneisneok.com/ai/apps-index.json`

The build fails if a source file belongs to no application, if two applications
claim the same file, or if a page reads a CSS variable that nothing defines.

## Books

Curated in `books/manifest.json`, keyed to Amazon listings. Each cover links to
the Traditional Chinese edition where one exists, and to the English edition
otherwise; every edition is recorded either way.

- Index: `https://thisoneisneok.com/ai/books-index.json`

## Blog

Sources live in `content/blog/`.

- Reading page: `https://thisoneisneok.com/blog/{slug}`
- Standalone HTML: `https://thisoneisneok.com/html/blog/{slug}.{locale}.html`
- Printable PDF: `https://thisoneisneok.com/pdf/blog/{slug}.{locale}.pdf`
- Markdown source: `https://thisoneisneok.com/md/blog/{slug}.{locale}.md`

Filename convention:

```text
content/blog/{slug}.zh.md
content/blog/{slug}.en.md
```

The two language files share one `slug` and one canonical article URL. If one
translation is absent, the site falls back to the available language rather than
blocking publication.

Required frontmatter:

```yaml
---
slug: example-entry
locale: zh
date: 2026-07-16
title: Example title
description: One-sentence description
tags: MSSP, PERSONAL NOTE
canonical: https://thisoneisneok.com/blog/example-entry
---
```

## Deployment

`bash deploy.sh` stamps a build id, builds, patches the Worker config, deploys,
and then verifies the live site against that build id. `wrangler deploy`
reporting success is not treated as evidence that the deploy landed — only a
matching build id on every checked surface is.

## Lifecycle labels

Statuses describe where something is, not how mature it is:

- Concept, Prototype, Evolving, Semi-stable, Archived

Formal verification carries a separate proof-status field tied to a specific
version and formal boundary. MSSP modules carry their own state, written in the
module document rather than in the page that lists them.

## Licence

Apache-2.0. Papers may carry their own licence statement in their text.
