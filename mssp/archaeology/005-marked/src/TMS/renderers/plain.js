// Plain-text rendering. Deliberately handles only two of the three token types,
// so the pipeline has something real to report as unhandled.
export const name = "renderers/plain";

export const renderers = {
  heading: (t) => `${"=".repeat(t.depth)} ${t.text}`,
  paragraph: (t) => t.text,
};
