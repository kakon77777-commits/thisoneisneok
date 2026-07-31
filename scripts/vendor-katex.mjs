// Copies KaTeX's stylesheet and web fonts into public/vendor/katex/.
//
// Self-hosted rather than CDN-linked: the published papers must render their
// notation with no third-party request, and a CDN going away would silently turn
// every formula back into unstyled fallback glyphs.
//
// woff2 only. Every browser that supports it covers the whole target audience,
// and shipping the woff/ttf fallbacks as well would roughly triple the payload
// for readers who would never fetch them.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "node_modules", "katex", "dist");
const target = path.join(root, "public", "vendor", "katex");

if (!fs.existsSync(source)) {
  console.error("katex is not installed — run `npm install`.");
  process.exit(2);
}

fs.mkdirSync(path.join(target, "fonts"), { recursive: true });

let css = fs.readFileSync(path.join(source, "katex.min.css"), "utf8");

// Drop the woff and ttf @font-face sources so the browser never requests a file
// this script did not copy. Written tolerantly (optional whitespace, each format
// matched independently) because KaTeX has changed this declaration's exact
// spacing between releases — 0.17 emits `url(…) format("woff2")` with a space,
// where earlier builds emitted no space.
css = css.replace(/\s*,\s*url\([^)]*\.(?:woff|ttf)\)\s*format\("(?:woff|truetype)"\)/g, "");

fs.writeFileSync(path.join(target, "katex.min.css"), css);

let fonts = 0;
for (const name of fs.readdirSync(path.join(source, "fonts"))) {
  if (!name.endsWith(".woff2")) continue;
  fs.copyFileSync(path.join(source, "fonts", name), path.join(target, "fonts", name));
  fonts += 1;
}

// A stylesheet referencing a font file that was not copied would fail silently in
// the browser, so check every url() the CSS still asks for.
const missing = [...css.matchAll(/url\(fonts\/([^)]+?)\)/g)]
  .map((match) => match[1])
  .filter((name) => !fs.existsSync(path.join(target, "fonts", name)));
if (missing.length) {
  console.error(`katex.min.css references ${missing.length} font file(s) that were not copied: ${[...new Set(missing)].join(", ")}`);
  process.exit(1);
}

console.log(`Vendored KaTeX: katex.min.css + ${fonts} woff2 fonts -> public/vendor/katex/`);
