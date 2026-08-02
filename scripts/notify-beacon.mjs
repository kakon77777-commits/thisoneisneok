// Notify the Continuous Discovery Beacon after a verified deploy.
//
// Run AFTER scripts/verify-deploy.mjs succeeds — deploy.sh's own gate for
// "the site is actually live and consistent," not just "wrangler deploy
// returned 0." Fires one 'updated' event for the homepage, content_hash'd to
// this build's build_id (public/ai/build-id.json, the same ground truth
// verify-deploy.mjs already checks), so the Beacon's own dedup naturally
// skips re-notifying for a build that was already reported.
//
// Missing BEACON_SUBMIT_TOKEN_NEOK is not an error — it means the
// integration isn't configured locally yet, matching the Beacon's own
// IndexNow adapter, which reports 'skipped' rather than failing when it has
// nothing to work with.
//
// Usage: node scripts/notify-beacon.mjs
import fs from "node:fs";
import path from "node:path";

const BEACON_URL = "https://beacon.evemiss.com/api/v1/events";
const SITE_ID = "thisoneisneok_com";
const SITE_URL = "https://thisoneisneok.com/";

async function main() {
  const token = process.env.BEACON_SUBMIT_TOKEN_NEOK;
  if (!token) {
    console.log("[skipped] BEACON_SUBMIT_TOKEN_NEOK not set - not notifying the Beacon.");
    return 0;
  }

  const truthPath = path.join(process.cwd(), "public", "ai", "build-id.json");
  if (!fs.existsSync(truthPath)) {
    console.error(`[FATAL] ${truthPath} not found - run node scripts/stamp-build.mjs first.`);
    return 2;
  }
  const truth = JSON.parse(fs.readFileSync(truthPath, "utf8"));
  const buildId = truth.build_id;

  const payload = {
    site_id: SITE_ID,
    url: SITE_URL,
    event_type: "updated",
    content_hash: `neok-build:${buildId}`,
    title: "Neo.K's personal site",
    summary: `Verified deploy, papers=${truth.paper_count}, posts=${truth.post_count}, build_id=${buildId}`,
    auto_dispatch: true,
  };

  let response;
  try {
    response = await fetch(BEACON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Explicit User-Agent required: Cloudflare's bot protection in front
        // of beacon.evemiss.com blocks generic/default fetch signatures with
        // a 403 (Cloudflare error 1010) before the request reaches the app.
        "User-Agent": "thisoneisneok-deploy-notify/1.0",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(`[FAILED] Could not reach Beacon: ${err.message}`);
    return 1;
  }

  const body = await response.text();
  if (response.ok) {
    console.log(`[ok] Beacon notified: ${response.status} ${body.slice(0, 200)}`);
    return 0;
  }
  console.error(`[FAILED] Beacon returned ${response.status}: ${body}`);
  return 1;
}

main().then((code) => process.exit(code));
