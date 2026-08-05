// HTML rendering, one function per token type. Knows no sibling renderer.
export const name = "renderers/html";
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export const renderers = {
  heading: (t) => `<h${t.depth}>${esc(t.text)}</h${t.depth}>`,
  paragraph: (t) => `<p>${esc(t.text)}</p>`,
  quote: (t) => `<blockquote>${esc(t.text)}</blockquote>`,
};
