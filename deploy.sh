#!/usr/bin/env bash
# Build + deploy + verify thisoneisneok.com in one gated step.
#   1. stamp a build_id into the app and public/ai/build-id.json
#   2. npm run build              -> fresh dist/ carrying that build_id
#   3. patch dist/server/wrangler.json (the Vite plugin rewrites it every build)
#   4. npx wrangler deploy
#   5. node scripts/verify-deploy.mjs
#   6. node scripts/notify-beacon.mjs -> tells the Continuous Discovery
#      Beacon (beacon.evemiss.com) this build is real and live. Only runs
#      after step 5 passes. Non-fatal if it fails or isn't configured
#      (BEACON_SUBMIT_TOKEN_NEOK unset): this site's own deploy must never
#      depend on the Beacon being reachable.
#
# Step 5 failing means the deploy is not actually consistent yet — stale edge
# cache, or a real bug. This script's exit code reflects that. Do NOT treat
# `wrangler deploy` succeeding, on its own, as "done".
set -euo pipefail

node scripts/stamp-build.mjs
npm run build
node scripts/patch-wrangler.mjs
npx wrangler deploy -c dist/server/wrangler.json
node scripts/verify-deploy.mjs "$@"
node scripts/notify-beacon.mjs || echo "[warn] Beacon notification failed - deploy itself succeeded, this is non-fatal"
