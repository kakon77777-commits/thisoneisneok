// Shared marked instance with KaTeX rendered at BUILD time, so a published paper
// is static `<span class="katex">` HTML and needs no client-side JavaScript.
//
// Technique and the hard-won details below are carried over from the Logic Matrix
// build (D:\Ai\work together\unbounded-axiom\shell\src\lib\md.ts and
// scripts/normalize_math.py), which renders the same author's notation.
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import katex from "katex";

// throwOnError:false — one malformed formula renders as inline error text instead
// of failing the whole 77-paper build.
// nonStandard:false — keeps standard delimiter rules (an opening $ must not be
// followed by a space), which stops prose like "NT$120" being read as math.
marked.use(markedKatex({ throwOnError: false, nonStandard: false }));

const LATEX_CMD = /\\[a-zA-Z]/;
const BLANK_LINE = /\n[ \t]*\n/;

// ADDITIONAL delimiters: \[ … \] display and \( … \) inline. marked-katex only
// handles $ forms; without these, LaTeX-standard delimiters render as raw text.
// The guards stop it eating non-math brackets: a display block must not cross a
// blank line and must contain a LaTeX command; inline must be one line and look
// like math.
marked.use({
  extensions: [
    {
      name: "displayMathBracket",
      level: "block",
      start(src) {
        const index = src.indexOf("\\[");
        return index < 0 ? undefined : index;
      },
      tokenizer(src) {
        const match = /^\\\[[ \t]*\r?\n?([\s\S]*?)\r?\n?[ \t]*\\\]/.exec(src);
        if (!match) return undefined;
        const body = match[1];
        if (BLANK_LINE.test(body) || !LATEX_CMD.test(body)) return undefined;
        return { type: "displayMathBracket", raw: match[0], text: body };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.text, { displayMode: true, throwOnError: false });
        } catch {
          return token.raw;
        }
      },
    },
    {
      name: "inlineMathParen",
      level: "inline",
      start(src) {
        const index = src.indexOf("\\(");
        return index < 0 ? undefined : index;
      },
      tokenizer(src) {
        const match = /^\\\(([^\n]{1,300}?)\\\)/.exec(src);
        if (!match) return undefined;
        const body = match[1];
        if (!LATEX_CMD.test(body) && !/[\^_=]/.test(body)) return undefined;
        return { type: "inlineMathParen", raw: match[0], text: body };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.text, { displayMode: false, throwOnError: false });
        } catch {
          return token.raw;
        }
      },
    },
  ],
});

// CJK ideographs, kana, fullwidth punctuation, dashes, ellipsis and curly quotes.
// Under nonStandard:false an inline `$` touching any of these is NOT recognised as
// a delimiter, so the formula would publish as raw LaTeX. Padding with one ASCII
// space is the reliable fix short of loosening the global delimiter rules — and
// this matters here far more than in an English corpus, because nearly every
// formula in these papers sits inside Traditional Chinese prose.
const CJK_ADJACENT = /[\u3000-\u303F\u4E00-\u9FFF\u3040-\u30FF\uFF00-\uFFEF\u2014\u2013\u2026\u2018\u2019\u201C\u201D]/;

export function padInlineMathForCJK(text) {
  const padProse = (segment) => {
    const out = [];
    let last = 0;
    for (const match of segment.matchAll(/\$[^$\n]+?\$/g)) {
      out.push(segment.slice(last, match.index));
      const left = match.index > 0 ? segment[match.index - 1] : " ";
      const rightIndex = match.index + match[0].length;
      const right = rightIndex < segment.length ? segment[rightIndex] : " ";
      out.push((CJK_ADJACENT.test(left) ? " " : "") + match[0] + (CJK_ADJACENT.test(right) ? " " : ""));
      last = rightIndex;
    }
    out.push(segment.slice(last));
    return out.join("");
  };

  // Only prose between display blocks is padded; the inside of a $$…$$ block is
  // left byte-for-byte alone.
  const out = [];
  let last = 0;
  for (const match of text.matchAll(/\$\$[\s\S]*?\$\$/g)) {
    out.push(padProse(text.slice(last, match.index)));
    out.push(match[0]);
    last = match.index + match[0].length;
  }
  out.push(padProse(text.slice(last)));
  return out.join("");
}

/**
 * Guarantees a `$$` display block is separated from surrounding text by a blank
 * line.
 *
 * marked-katex's display tokenizer is block level, so a `$$` that opens on the
 * line straight after prose is swallowed into that paragraph and never rendered.
 * These papers hit it where a numbered proposition introduces its own formula:
 *
 *     20.
 *     $$
 *     \boxed{...}
 *     $$
 *
 * Line-based and stateful, so only the opening and closing delimiters of a real
 * display block are touched and a `$$` inside one is left alone.
 */
export function separateDisplayMathBlocks(text) {
  const out = [];
  let inDisplay = false;
  for (const line of text.split("\n")) {
    const isDelimiter = line.trim() === "$$";
    if (isDelimiter && !inDisplay) {
      if (out.length && out[out.length - 1].trim() !== "") out.push("");
      out.push(line);
      inDisplay = true;
      continue;
    }
    if (isDelimiter && inDisplay) {
      out.push(line);
      inDisplay = false;
      continue;
    }
    // First line after a closing delimiter must not hug it either.
    if (!inDisplay && out.length && out[out.length - 1].trim() === "$$" && line.trim() !== "") out.push("");
    out.push(line);
  }
  return out.join("\n");
}

/** Count of formulas KaTeX actually rendered, used as a build-time assertion. */
export function countRenderedMath(html) {
  return (html.match(/class="katex/g) || []).length;
}

/**
 * Math delimiters still present in the rendered HTML — i.e. formulas that
 * published as raw LaTeX.
 *
 * This is the metric that matters, not the rendered count. "17,161 formulas
 * rendered" was green while two papers still shipped a visible `$$\boxed{...}$$`
 * to the reader; a total can always rise while a few stragglers stay broken.
 */
export function countLeftoverRawMath(html) {
  return (html.match(/\$\$/g) || []).length;
}

/** Formulas KaTeX refused, which it marks with its own error colour. */
export function countMathErrors(html) {
  return (html.match(/katex-error/g) || []).length;
}

export function renderMarkdown(markdown) {
  return marked.parse(padInlineMathForCJK(separateDisplayMathBlocks(markdown)));
}

export { marked, katex };
