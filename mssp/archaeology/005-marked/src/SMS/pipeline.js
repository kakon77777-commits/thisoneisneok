// text -> tokens -> string, in three stages that do not know each other.
//
// marked's shape, kept, because it is right: a Lexer that only tokenises, a
// Parser that only walks, and a Renderer that is one function per token type.
// Twenty-one methods on marked's Renderer, one each for heading, list, link,
// codespan and the rest — so replacing the treatment of one construct means
// replacing one function, not subclassing a document model.

export function lex(text) {
  const tokens = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) tokens.push({ type: "heading", depth: heading[1].length, text: heading[2] });
    else if (line.startsWith("> ")) tokens.push({ type: "quote", text: line.slice(2) });
    else tokens.push({ type: "paragraph", text: line });
  }
  return tokens;
}

export function parse(tokens, renderer) {
  return tokens
    .map((token) => {
      const fn = renderer[token.type];
      // An unhandled token type is a reported outcome, not a dropped one.
      // marked falls back to a built-in for every type, which is friendlier and
      // means a renderer that handles nothing produces a full document.
      if (typeof fn !== "function") return { ok: false, type: token.type, out: "" };
      return { ok: true, type: token.type, out: fn(token) };
    });
}
