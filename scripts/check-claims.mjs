// Fails the build when the site's prose contradicts what the site actually does.
//
// Written after a specific miss. Papers moved from "HTML and PDF only" to also
// publishing their Markdown. Five places were updated; the MSSP page was not,
// and it went on telling readers "Markdown 不對外發佈" next to 77 working
// download links. Nothing caught it, because prose is not code and no test
// reads it.
//
// This cannot check prose in general. It checks specific pairs: a fact the build
// can determine, and the phrasings that assert its opposite. Each pair is cheap,
// and each one exists because the claim it guards actually went stale once.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|mjs|md|txt|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Source that describes the site to a reader. Build scripts are excluded: their
// comments legitimately narrate history, including policies that have changed.
const PROSE = [
  ...walk(path.join(root, "app")),
  ...walk(path.join(root, "public")).filter((f) => !f.includes(`${path.sep}md${path.sep}`) && !f.includes(`${path.sep}html${path.sep}`)),
  ...walk(path.join(root, "mssp", "modules")),
];

const papersPublishMarkdown = fs.existsSync(path.join(root, "public", "md", "papers")) &&
  fs.readdirSync(path.join(root, "public", "md", "papers")).some((name) => name.endsWith(".md"));

const CLAIMS = [
  {
    when: papersPublishMarkdown,
    fact: "papers publish their Markdown (public/md/papers is populated)",
    forbidden: [
      /Markdown\s*不對外發佈/,
      /原始\s*Markdown\s*不對外/,
      /只以\s*HTML\s*與\s*PDF\s*發表/,
      /Markdown (?:sources? )?(?:is|are) not distributed/i,
      /publish(?:es)? as HTML and PDF only/i,
    ],
  },
];

const problems = [];
for (const claim of CLAIMS) {
  if (!claim.when) continue;
  for (const file of PROSE) {
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of claim.forbidden) {
      const match = text.match(pattern);
      if (!match) continue;
      const line = text.slice(0, match.index).split("\n").length;
      problems.push(
        `${path.relative(root, file).replaceAll("\\", "/")}:${line} claims the opposite of a fact the build can see\n` +
          `    fact:  ${claim.fact}\n` +
          `    text:  ${match[0]}`,
      );
    }
  }
}

if (problems.length) {
  console.error("Stale claims:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nUpdate the prose, or change the behaviour it describes. Do not delete the check.");
  process.exit(1);
}

console.log(`Claims consistent: ${CLAIMS.filter((c) => c.when).length} fact(s) checked against ${PROSE.length} files.`);
