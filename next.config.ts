import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every image on this site is a hand-sized WebP already under 100 KB, so the
    // runtime `/_vinext/image` path buys nothing and would add a hard dependency
    // on the Cloudflare ASSETS + IMAGES bindings (which 500 without them).
    //
    // vinext 0.0.50 does NOT read this flag — verified: images still rewrote to
    // /_vinext/image with it set. Every <Image> therefore also carries the
    // per-component `unoptimized` prop, which is what actually takes effect.
    // Keep both: this line documents the intent and becomes load-bearing if
    // vinext starts honouring it.
    unoptimized: true,
  },
};

export default nextConfig;
