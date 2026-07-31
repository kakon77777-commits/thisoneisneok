# Neo.K × EveMissLab Source Guide

Canonical site: https://thisoneisneok.com/

## Purpose

The site keeps a clear separation between human presentation and machine-readable source.

- Human reading page: `https://thisoneisneok.com/blog/{slug}`
- Standalone HTML: `https://thisoneisneok.com/html/blog/{slug}.{locale}.html`
- Printable PDF: `https://thisoneisneok.com/pdf/blog/{slug}.{locale}.pdf`
- Raw Markdown: `https://thisoneisneok.com/md/blog/{slug}.{locale}.md`
- AI index: `https://thisoneisneok.com/ai/site-index.md`

## Content workflow

1. Add a Markdown source file to `content/blog/`.
2. Use a stable slug and an absolute canonical URL in frontmatter.
3. Run `npm run content:build`.
4. The generator produces the reading index, raw Markdown copy, standalone HTML, PDF, RSS, sitemap, and AI metadata.

## Filename convention

```text
content/blog/{slug}.zh.md
content/blog/{slug}.en.md
```

The two language files share one `slug` and one canonical article URL. If one translation is absent, the website falls back to the available language rather than blocking publication.

## Required frontmatter

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

## Lifecycle labels

The application catalog uses lifecycle labels instead of claiming final maturity:

- Concept
- Prototype
- Evolving
- Semi-stable
- Archived

Formal verification has a separate proof-status field tied to a specific version and formal boundary.
