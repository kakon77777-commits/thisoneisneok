// Books pipeline: books/manifest.json -> covers + app/data/books.generated.ts.
//
// Each book links to its Amazon listing. Neo's rule: prefer the Traditional
// Chinese edition, fall back to English when there is no Chinese one. Every
// edition is still recorded, so the other language stays reachable.
//
// Covers are fetched once from Amazon and re-encoded locally. Hot-linking
// m.media-amazon.com would put a book's cover — the one thing a reader looks at
// first — behind a third party that can block, resize, or expire the URL.
//
// `--refresh-covers` re-downloads. Without it, an existing local cover is kept,
// so a normal build needs no network.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const manifestPath = path.join(root, "books", "manifest.json");
const coverDir = path.join(root, "public", "media", "books");
const siteUrl = "https://thisoneisneok.com";
const refresh = process.argv.includes("--refresh-covers");

if (!fs.existsSync(manifestPath)) {
  console.log("No books/manifest.json — nothing to build.");
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const problems = [];
const fail = (message) => problems.push(message);

fs.mkdirSync(coverDir, { recursive: true });

const seenAsin = new Map();
const slugs = new Set();

for (const book of manifest.books) {
  if (!book.slug || !/^[a-z0-9-]+$/.test(book.slug)) fail(`bad slug: ${book.slug}`);
  if (slugs.has(book.slug)) fail(`duplicate slug: ${book.slug}`);
  slugs.add(book.slug);
  for (const key of ["title", "subtitle", "editions", "cover"]) {
    if (!book[key]) fail(`${book.slug}: missing ${key}`);
  }
  if (!book.editions?.length) fail(`${book.slug}: needs at least one edition`);
  for (const edition of book.editions ?? []) {
    if (!/^B0[A-Z0-9]{8}$/.test(edition.asin ?? "")) fail(`${book.slug}: bad ASIN ${edition.asin}`);
    if (!["zh", "en"].includes(edition.lang)) fail(`${book.slug}: edition lang must be zh or en`);
    // The same ASIN under two books would mean one of them links to the wrong
    // listing — the kind of error that looks fine on the page.
    if (seenAsin.has(edition.asin)) fail(`ASIN ${edition.asin} is claimed by both ${seenAsin.get(edition.asin)} and ${book.slug}`);
    seenAsin.set(edition.asin, book.slug);
  }
  if (book.related && !manifest.books.some((other) => other.slug === book.related)) {
    fail(`${book.slug}: related slug does not exist: ${book.related}`);
  }
}

if (problems.length) {
  console.error("Book manifest problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const collected = [];
let fetched = 0;
let reused = 0;

for (const book of manifest.books) {
  const target = path.join(coverDir, `${book.slug}.webp`);

  if (refresh || !fs.existsSync(target)) {
    const raw = path.join(coverDir, `${book.slug}.download`);
    try {
      execFileSync("curl", [
        "-sS", "--fail", "--max-time", "60",
        "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "-o", raw, book.cover,
      ], { stdio: "pipe" });
      execFileSync("python", ["-c", [
        "import sys",
        "from PIL import Image",
        "im = Image.open(sys.argv[1]).convert('RGB')",
        "w = 640",
        "if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)",
        "im.save(sys.argv[2], 'WEBP', quality=84, method=6)",
      ].join("\n"), raw, target], { stdio: "pipe" });
      fs.unlinkSync(raw);
      fetched += 1;
    } catch (error) {
      fs.rmSync(raw, { force: true });
      fail(`${book.slug}: could not fetch or convert cover — ${(error.stderr?.toString() || error.message).split("\n")[0]}`);
      continue;
    }
  } else {
    reused += 1;
  }

  // Prefer Chinese; fall back to English. The fallback is not decorative: two of
  // these books have no Chinese edition at all.
  const zh = book.editions.find((edition) => edition.lang === "zh");
  const en = book.editions.find((edition) => edition.lang === "en");
  const primary = zh ?? en;
  if (!primary) {
    fail(`${book.slug}: no usable edition`);
    continue;
  }

  collected.push({
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    series: book.series ?? "",
    seriesIndex: book.seriesIndex ?? 0,
    related: book.related ?? "",
    image: `/media/books/${book.slug}.webp`,
    primaryLang: primary.lang,
    url: `https://www.amazon.com/dp/${primary.asin}`,
    editions: book.editions.map((edition) => ({
      lang: edition.lang,
      asin: edition.asin,
      title: edition.title,
      url: `https://www.amazon.com/dp/${edition.asin}`,
    })),
    bilingual: Boolean(zh && en),
  });
}

if (problems.length) {
  console.error("Book build problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

fs.writeFileSync(
  path.join(root, "app", "data", "books.generated.ts"),
  `// Generated by scripts/build-books.mjs from books/manifest.json.\n` +
    `// Do not edit by hand — edit the manifest, then rerun the script.\n` +
    `export const books = ${JSON.stringify(collected, null, 2)};\n\n` +
    `export const bookCount = ${collected.length};\n` +
    `export const bookEditionCount = ${collected.reduce((total, book) => total + book.editions.length, 0)};\n`,
);

fs.mkdirSync(path.join(root, "public", "ai"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public", "ai", "books-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      editions: collected.reduce((total, book) => total + book.editions.length, 0),
      note: "Published books. `url` follows the site's link rule: Traditional Chinese edition when one exists, English otherwise. `editions` lists every edition regardless.",
      books: collected.map(({ slug, title, subtitle, series, url, primaryLang, editions }) => ({
        slug, title, subtitle, series, url, primaryLang,
        editions: editions.map(({ lang, asin, url: editionUrl }) => ({ lang, asin, url: editionUrl })),
      })),
    },
    null,
    2,
  ),
);

const zhOnly = collected.filter((book) => !book.bilingual && book.primaryLang === "zh").length;
const enOnly = collected.filter((book) => !book.bilingual && book.primaryLang === "en").length;
console.log(`Built ${collected.length} books (${collected.reduce((t, b) => t + b.editions.length, 0)} editions).`);
console.log(`  bilingual: ${collected.filter((b) => b.bilingual).length}, Chinese only: ${zhOnly}, English only: ${enOnly}`);
console.log(`  covers: ${fetched} fetched, ${reused} reused${refresh ? " (--refresh-covers)" : ""}`);
