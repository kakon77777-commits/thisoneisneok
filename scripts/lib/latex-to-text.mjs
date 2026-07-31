// Converts LaTeX notation into readable Unicode for the PDF renderer.
//
// The HTML pages get real KaTeX typesetting. PDFs are drawn with pdfkit, which
// cannot lay out math, so the choice is between printing `$$\mathcal{I} \neq
// \mathcal{C}$$` verbatim and transliterating it to `𝓘 ≠ 𝓒`. This does the latter.
//
// It is deliberately lossy and does not pretend otherwise: fractions become
// (a)/(b), matrices flatten to rows. The goal is a reader who can follow the
// argument, with the HTML page as the typeset reference.
//
// Every replacement is checked against the embedded font at load time. A glyph
// the font lacks would print as a .notdef box — swapping raw LaTeX for tofu is
// not an improvement — so unsupported characters fall back to an ASCII form.
import fs from "node:fs";
// fontkit ships as CommonJS with named exports only, so `import fontkit from`
// fails under ESM. It arrives as a transitive dependency of pdfkit.
import * as fontkit from "fontkit";

let font = null;
export function useFont(fontPath) {
  if (fs.existsSync(fontPath)) font = fontkit.openSync(fontPath);
  return font;
}

function supported(text) {
  if (!font) return true;
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp < 0x80) continue;
    if (!font.hasGlyphForCodePoint(cp)) return false;
  }
  return true;
}

/** Preferred Unicode form, with an ASCII fallback when the font lacks the glyph. */
function glyph(preferred, fallback) {
  return supported(preferred) ? preferred : fallback;
}

const GREEK = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε",
  zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ",
  lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ",
  tau: "τ", upsilon: "υ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π",
  Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const SYMBOLS = {
  rightarrow: ["→", "->"], to: ["→", "->"], longrightarrow: ["→", "-->"],
  leftarrow: ["←", "<-"], leftrightarrow: ["↔", "<->"], mapsto: ["↦", "|->"],
  Rightarrow: ["⇒", "=>"], Leftarrow: ["⇐", "<="], Leftrightarrow: ["⇔", "<=>"],
  implies: ["⇒", "=>"], iff: ["⇔", "<=>"],
  neq: ["≠", "!="], ne: ["≠", "!="], leq: ["≤", "<="], le: ["≤", "<="],
  geq: ["≥", ">="], ge: ["≥", ">="], approx: ["≈", "~="], equiv: ["≡", "=="],
  sim: ["∼", "~"], simeq: ["≃", "~="], propto: ["∝", "prop"],
  ll: ["≪", "<<"], gg: ["≫", ">>"],
  in: ["∈", "in"], notin: ["∉", "not in"], ni: ["∋", "contains"],
  subset: ["⊂", "sub"], subseteq: ["⊆", "subeq"], supset: ["⊃", "sup"],
  supseteq: ["⊇", "supeq"], cup: ["∪", "U"], cap: ["∩", "^"],
  emptyset: ["∅", "{}"], varnothing: ["∅", "{}"], setminus: ["∖", "\\"],
  forall: ["∀", "for all"], exists: ["∃", "exists"], nexists: ["∄", "not exists"],
  neg: ["¬", "not "], lnot: ["¬", "not "], land: ["∧", "and"], wedge: ["∧", "and"],
  lor: ["∨", "or"], vee: ["∨", "or"], top: ["⊤", "T"], bot: ["⊥", "F"],
  times: ["×", "x"], cdot: ["·", "."], div: ["÷", "/"], pm: ["±", "+/-"],
  oplus: ["⊕", "(+)"], otimes: ["⊗", "(x)"], circ: ["∘", "o"],
  infty: ["∞", "inf"], partial: ["∂", "d"], nabla: ["∇", "grad"],
  sum: ["∑", "SUM"], prod: ["∏", "PROD"], int: ["∫", "INT"],
  sqrt: ["√", "sqrt"], angle: ["∠", "angle"], perp: ["⊥", "perp"],
  parallel: ["∥", "||"], models: ["⊨", "|="], vdash: ["⊢", "|-"],
  cdots: ["⋯", "..."], ldots: ["…", "..."], dots: ["…", "..."],
  vdots: ["⋮", "..."], ddots: ["⋱", "..."],
  langle: ["⟨", "<"], rangle: ["⟩", ">"],
  lfloor: ["⌊", "|_"], rfloor: ["⌋", "_|"], lceil: ["⌈", "|^"], rceil: ["⌉", "^|"],
  star: ["⋆", "*"], bullet: ["•", "*"], dagger: ["†", "+"],
  aleph: ["ℵ", "aleph"], hbar: ["ℏ", "hbar"], ell: ["ℓ", "l"], Re: ["ℜ", "Re"], Im: ["ℑ", "Im"],
};

// Mathematical Alphanumeric Symbols. CJK fonts often omit this block entirely,
// which is why each one is coverage-checked rather than assumed.
const SCRIPT = "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵";
const DOUBLE = "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ";

const SUPERSCRIPT = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻", n: "ⁿ", i: "ⁱ" };
const SUBSCRIPT = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", n: "ₙ", i: "ᵢ", j: "ⱼ", k: "ₖ", t: "ₜ" };

/** Reads the balanced {...} group starting at `start`; null when unbalanced. */
function readGroup(text, start) {
  if (text[start] !== "{") return null;
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return { body: text.slice(start + 1, i), end: i + 1 };
    }
  }
  return null;
}

function alphabetise(body, alphabet, prefix) {
  const letter = body.trim();
  if (!/^[A-Z]$/.test(letter)) return convert(body);
  const mapped = [...alphabet][letter.charCodeAt(0) - 65];
  return supported(mapped) ? mapped : `${prefix}${letter}`;
}

function scriptify(body, table, wrapper) {
  const chars = [...body];
  const mapped = chars.map((char) => table[char]);
  if (chars.length && mapped.every((value) => value && supported(value))) return mapped.join("");
  return `${wrapper}(${convert(body)})`;
}

export function convert(input) {
  let text = input;
  let out = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === "\\") {
      const nameMatch = /^\\([a-zA-Z]+)/.exec(text.slice(i));
      if (!nameMatch) {
        // \\ is a row break inside matrices and aligned blocks.
        if (text[i + 1] === "\\") { out += "; "; i += 2; continue; }
        // Spacing commands (\, \; \: \!) are layout, not content. Emitting the
        // punctuation literally turned "f(t)\,dt" into "f(t),dt".
        if (",;: ".includes(text[i + 1])) { out += " "; i += 2; continue; }
        if (text[i + 1] === "!") { i += 2; continue; }
        // Escaped literal such as \{ or \%.
        out += text[i + 1] ?? "";
        i += 2;
        continue;
      }
      const name = nameMatch[1];
      let cursor = i + nameMatch[0].length;

      if (name === "frac" || name === "dfrac" || name === "tfrac") {
        const numerator = readGroup(text, cursor);
        const denominator = numerator && readGroup(text, numerator.end);
        if (numerator && denominator) {
          out += `(${convert(numerator.body)})/(${convert(denominator.body)})`;
          i = denominator.end;
          continue;
        }
      }
      if (name === "mathcal" || name === "mathscr") {
        const group = readGroup(text, cursor);
        if (group) { out += alphabetise(group.body, SCRIPT, "cal-"); i = group.end; continue; }
      }
      if (name === "mathbb") {
        const group = readGroup(text, cursor);
        if (group) { out += alphabetise(group.body, DOUBLE, "bb-"); i = group.end; continue; }
      }
      if (["text", "mathrm", "textbf", "mathbf", "mathit", "textit", "operatorname", "mathsf", "mathtt", "boldsymbol"].includes(name)) {
        const group = readGroup(text, cursor);
        if (group) { out += convert(group.body); i = group.end; continue; }
      }
      if (name === "boxed") {
        const group = readGroup(text, cursor);
        if (group) { out += `【${convert(group.body)}】`; i = group.end; continue; }
      }
      if (name === "begin" || name === "end") {
        const group = readGroup(text, cursor);
        if (group) { out += name === "end" ? "" : ""; i = group.end; continue; }
      }
      if (name === "left" || name === "right" || name === "big" || name === "Big" || name === "quad" || name === "qquad") {
        out += name === "quad" || name === "qquad" ? "  " : "";
        i = cursor;
        continue;
      }
      if (GREEK[name]) {
        out += glyph(GREEK[name], name);
        i = cursor;
        continue;
      }
      if (SYMBOLS[name]) {
        const [preferred, fallback] = SYMBOLS[name];
        const rendered = glyph(preferred, fallback);
        // Word-style fallbacks need breathing room; symbols do not.
        out += /^[A-Za-z]/.test(rendered) ? ` ${rendered} ` : rendered;
        i = cursor;
        continue;
      }
      // Unknown command: drop the backslash, keep the name so nothing vanishes.
      out += name;
      i = cursor;
      continue;
    }

    if (char === "^" || char === "_") {
      const table = char === "^" ? SUPERSCRIPT : SUBSCRIPT;
      const group = readGroup(text, i + 1);
      if (group) { out += scriptify(group.body, table, char); i = group.end; continue; }
      const next = text[i + 1];
      if (next && table[next]) { out += table[next]; i += 2; continue; }
      out += char;
      i += 1;
      continue;
    }

    if (char === "&") { out += "  "; i += 1; continue; }
    if (char === "{" || char === "}") { i += 1; continue; }
    if (char === "~") { out += " "; i += 1; continue; }

    out += char;
    i += 1;
  }

  return out.replace(/[ \t]{3,}/g, "  ").trim();
}

/** Replaces $…$ and $$…$$ spans in a Markdown line with transliterated text. */
export function convertMathSpans(line) {
  return line
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, body) => convert(body))
    .replace(/\$([^$\n]+?)\$/g, (_, body) => convert(body));
}
