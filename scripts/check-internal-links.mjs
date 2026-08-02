// Fails the build when hand-written prose links to a page this site does not
// publish.
//
// Written after three broken links shipped across two days, all of the same
// kind: a URL guessed from where a file lives rather than read from where the
// build puts it. `mssp/examples/002-link-checker/` publishes to
// `/html/mssp/002-link-checker.html`, not `/html/mssp/examples/...`; research
// entries publish under `/html/research/`, not `/research/`.
//
// Nothing could see it. The deploy gate checks pages it is given a list of, and
// a link inside a page's prose is not on any list — so a wrong one is invisible
// until a reader clicks it.
//
// This resolves against the built output rather than the live site: it has to
// fail before a deploy, not after one, and it must not need the network.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");

// Routes the Next app owns. They have no file in public/, so they are listed
// rather than discovered — and listed narrowly, because a too-generous entry
// here turns this check off for everything under it.
const APP_ROUTES = new Set([
  "/", "/papers", "/blog", "/books", "/apps", "/experiments",
  "/mssp", "/research", "/lean4", "/about",
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push("/" + path.relative(publicDir, full).replaceAll("\\", "/"));
  }
  return out;
}

const published = new Set(walk(publicDir));

// Prose written by hand. Generated pages are excluded: their links come from
// the same build that decides the URLs, so they cannot disagree with it.
const SOURCES = [
  ...fs.existsSync(path.join(root, "mssp", "modules"))
    ? fs.readdirSync(path.join(root, "mssp", "modules")).map((f) => path.join("mssp", "modules", f))
    : [],
  ...["mssp/examples", "mssp/archaeology"].flatMap((dir) => {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) return [];
    return fs.readdirSync(full)
      .map((entry) => path.join(dir, entry, "README.md"))
      .filter((p) => fs.existsSync(path.join(root, p)));
  }),
].filter((p) => p.endsWith(".md"));

const problems = [];
let checked = 0;

for (const rel of SOURCES) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  for (const match of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = match[1].split("#")[0].replace(/\/$/, "") || "/";
    checked += 1;
    if (APP_ROUTES.has(href) || published.has(href) || published.has(`${href}.html`)) continue;
    const line = text.slice(0, match.index).split("\n").length;
    problems.push(`${rel.replaceAll("\\", "/")}:${line} -> ${match[1]}`);
  }
}

if (problems.length) {
  console.error(`Broken internal links (${problems.length} of ${checked} checked):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nThe URL a page publishes to is decided by its build script, not by where its source lives.");
  process.exit(1);
}

console.log(`Internal links resolve: ${checked} link(s) across ${SOURCES.length} hand-written file(s).`);
