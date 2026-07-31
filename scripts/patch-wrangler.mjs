// The Cloudflare Vite plugin regenerates dist/server/wrangler.json on every
// build, so deployment settings cannot simply be written there once. This patch
// runs after the build and re-applies the few fields the deploy needs:
// the Worker name, the ASSETS binding, and the custom domain route.
//
// Everything else in the generated file (module rules, no_bundle, compatibility
// date) is left exactly as the plugin produced it.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "dist", "server", "wrangler.json");

if (!fs.existsSync(target)) {
  console.error("dist/server/wrangler.json not found — run `npm run build` first.");
  process.exit(2);
}

const config = JSON.parse(fs.readFileSync(target, "utf8"));

config.name = "thisoneisneok";
config.topLevelName = "thisoneisneok";
// html_handling "none" is required, not cosmetic. Cloudflare's default
// ("auto-trailing-slash") 307s /foo.html to /foo — but every canonical URL this
// site publishes carries the .html extension: the paper links, papers-index.json,
// sitemap.xml, and the canonical baked into each page and PDF. Under the default
// all 77 of them redirect, and each page's own <link rel="canonical"> then
// disagrees with the URL actually serving it.
config.assets = {
  ...(config.assets ?? {}),
  directory: "../client",
  binding: "ASSETS",
  html_handling: "none",
};
config.observability = { enabled: true };

// Keep the workers.dev URL alive. Wrangler disables it by default when the key
// is absent, which silently removes the only reachable URL while the apex
// domain is still attached elsewhere.
config.workers_dev = true;

// The apex is attached only when explicitly asked for. Attaching fails with
// Cloudflare error 100117 while another service (here: the Pages project
// `knowledgerevolutionwebsite`) still owns thisoneisneok.com's DNS records, and
// a failed attach aborts the whole deploy — so this is opt-in, not the default.
// en.thisoneisneok.com is attached to the same Worker purely so it can 301 to
// the apex (see worker/index.ts) — the site is bilingual on one URL, so the old
// English subdomain has nothing of its own left to serve.
if (process.env.ATTACH_APEX === "1") {
  config.routes = [
    { pattern: "thisoneisneok.com", custom_domain: true },
    { pattern: "en.thisoneisneok.com", custom_domain: true },
  ];
} else {
  delete config.routes;
}

fs.writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`);
console.log(
  `Patched ${path.relative(root, target)}: name=${config.name}, workers_dev=true, ` +
    `apex=${process.env.ATTACH_APEX === "1" ? "attached" : "not attached (set ATTACH_APEX=1)"}`,
);
