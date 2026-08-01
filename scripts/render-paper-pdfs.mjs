// Renders one PDF per paper from the SAME Markdown that produced its HTML page,
// so the two published formats can never drift apart.
//
// Note on method: this draws through pdfkit rather than printing the HTML with a
// headless browser. It keeps the embedded Traditional Chinese font deterministic
// and adds no browser dependency; tables and images in the source degrade to
// plain text lines, which is the known trade-off.
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { useFont, convertMathSpans } from "./lib/latex-to-text.mjs";

const root = process.cwd();

const outputDir = path.join(root, "public", "pdf", "papers");
const fontDir = path.join(root, "node_modules", "@embedpdf", "fonts-tc", "fonts");
const regularFont = path.join(fontDir, "NotoSansHant-Regular.otf");
const boldFont = path.join(fontDir, "NotoSansHant-Bold.otf");
const PAGE = { width: 595.28, height: 841.89, left: 58, right: 58, top: 58, bottom: 48 };
const colors = { paper: "#F2EFE8", ink: "#171914", muted: "#676B62", green: "#315B53", line: "#C9C7BE" };

const manifestPath = path.join(root, "app", "data", "papers.generated.ts");
if (!fs.existsSync(manifestPath)) {
  console.error("Run scripts/build-papers.mjs first — papers.generated.ts is missing.");
  process.exit(2);
}
const manifestSource = fs.readFileSync(manifestPath, "utf8");
const series = JSON.parse(manifestSource.slice(manifestSource.indexOf("["), manifestSource.lastIndexOf("]") + 1));

// Math is transliterated against the very font that will draw it, so a symbol the
// font lacks degrades to an ASCII form instead of printing as a .notdef box.
useFont(regularFont);

function stripInline(value) {
  return convertMathSpans(value)
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)")
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .replace(/\s*\|\s*/g, "   ");
}

function bodyOf(sourcePath) {
  const source = fs.readFileSync(sourcePath, "utf8");
  if (!source.startsWith("---\n")) return source;
  const end = source.indexOf("\n---\n", 4);
  return end === -1 ? source : source.slice(end + 5);
}

function render(target, paper, body) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right },
    bufferPages: true,
    info: { Title: paper.title, Author: paper.author || "Neo.K", Subject: paper.summary || paper.seriesCode },
  });
  doc.pipe(fs.createWriteStream(target));
  doc.registerFont("Noto", regularFont);
  doc.registerFont("NotoBold", boldFont);

  const contentWidth = PAGE.width - PAGE.left - PAGE.right;
  const usableBottom = PAGE.height - PAGE.bottom - 22;

  const paintPage = () => {
    doc.save();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill(colors.paper);
    doc.strokeColor(colors.line).lineWidth(0.6).moveTo(PAGE.left, 42).lineTo(PAGE.width - PAGE.right, 42).stroke();
    doc.restore();
  };
  paintPage();
  doc.on("pageAdded", paintPage);

  const ensure = (height) => {
    if (doc.y + height > usableBottom) doc.addPage();
  };

  doc.fillColor(colors.green).font("NotoBold").fontSize(8)
    .text(`NEO.K / ${paper.seriesCode} / ${paper.id}`, PAGE.left, PAGE.top, { width: contentWidth, characterSpacing: 1.3 });
  doc.moveDown(1.6);
  doc.fillColor(colors.ink).font("NotoBold").fontSize(24).lineGap(5).text(paper.title, { width: contentWidth });
  if (paper.englishTitle) {
    doc.moveDown(0.4);
    doc.fillColor(colors.muted).font("Noto").fontSize(10).lineGap(2).text(paper.englishTitle, { width: contentWidth });
  }
  doc.moveDown(0.6);
  const facts = [paper.version, paper.date, paper.author, paper.status].filter(Boolean).join("   /   ");
  doc.fillColor(colors.muted).font("Noto").fontSize(9).text(facts, { width: contentWidth });
  if (paper.evidence) {
    doc.moveDown(0.3);
    doc.fillColor(colors.muted).fontSize(8.5).text(`證據狀態：${paper.evidence}`, { width: contentWidth });
  }
  doc.moveDown(0.55);
  doc.fillColor(colors.green).fontSize(8)
    .text(`${paper.canonicalUrl}`, { width: contentWidth, link: paper.canonicalUrl, underline: false });
  doc.moveDown(1.3);
  doc.strokeColor(colors.line).lineWidth(0.6).moveTo(PAGE.left, doc.y).lineTo(PAGE.width - PAGE.right, doc.y).stroke();
  doc.moveDown(1.2);

  let bullets = [];
  const flushBullets = () => {
    for (const bullet of bullets) {
      ensure(32);
      const y = doc.y + 4;
      doc.fillColor(colors.green).circle(PAGE.left + 4, y + 4, 2.1).fill();
      doc.fillColor(colors.ink).font("Noto").fontSize(10).lineGap(4.5)
        .text(stripInline(bullet), PAGE.left + 18, y, { width: contentWidth - 18 });
      doc.moveDown(0.28);
    }
    bullets = [];
  };

  let inFence = false;
  let seenFirstHeading = false;
  let titleSkipped = false;

  // A $$…$$ display block spans several lines, so it is buffered whole and then
  // transliterated in one pass — converting line by line would break formulas
  // that wrap, and `convertMathSpans` only sees single-line spans.
  let inDisplayMath = false;
  let displayBuffer = [];
  const flushDisplayMath = () => {
    const source = displayBuffer.join("\n").trim();
    displayBuffer = [];
    if (!source) return;
    const rendered = convertMathSpans(`$$${source}$$`);
    if (!rendered.trim()) return;
    ensure(52);
    doc.moveDown(0.45);
    const y = doc.y;
    const height = doc.font("Noto").fontSize(11).heightOfString(rendered, { width: contentWidth - 30, lineGap: 4 });
    doc.save().strokeColor(colors.line).lineWidth(1).moveTo(PAGE.left, y).lineTo(PAGE.left, y + height + 8).stroke().restore();
    doc.fillColor(colors.ink).font("Noto").fontSize(11).lineGap(4)
      .text(rendered, PAGE.left + 18, y + 3, { width: contentWidth - 30 });
    doc.y = y + height + 14;
    doc.x = PAGE.left;
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();

    if (line === "$$") {
      flushBullets();
      if (inDisplayMath) flushDisplayMath();
      inDisplayMath = !inDisplayMath;
      continue;
    }
    if (inDisplayMath) {
      displayBuffer.push(raw);
      continue;
    }

    if (line.startsWith("```")) {
      inFence = !inFence;
      flushBullets();
      continue;
    }
    if (inFence) {
      ensure(20);
      doc.fillColor(colors.muted).font("Noto").fontSize(8.6).lineGap(2.6).text(raw, { width: contentWidth });
      continue;
    }
    if (!line || /^-{3,}$/.test(line) || /^\|\s*-+/.test(line)) {
      flushBullets();
      continue;
    }
    if (line.startsWith("# ")) {
      flushBullets();
      if (!titleSkipped) {
        // The paper's own title, already set above.
        titleSkipped = true;
        seenFirstHeading = true;
        continue;
      }
      // Every later H1 is a section. 81 of the 89 papers number their sections
      // `# 1.` `# 2.`, and skipping all of them dropped 2,433 headings across
      // the corpus — those PDFs ran as unbroken prose with no structure at all.
      ensure(72);
      doc.moveDown(0.85);
      doc.fillColor(colors.green).font("NotoBold").fontSize(7.8).text("SECTION", { width: contentWidth, characterSpacing: 1 });
      doc.moveDown(0.5);
      doc.fillColor(colors.ink).font("NotoBold").fontSize(17).lineGap(3.8).text(stripInline(line.slice(2)), { width: contentWidth });
      doc.moveDown(0.45);
      seenFirstHeading = true;
      continue;
    }
    // Header label block ("**日期：** ...") duplicates the facts line above.
    if (!seenFirstHeading && /^\*\*.+\*\*/.test(line)) continue;

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
      continue;
    }
    flushBullets();

    if (line.startsWith("### ")) {
      ensure(50);
      doc.moveDown(0.55);
      doc.fillColor(colors.ink).font("NotoBold").fontSize(12.5).lineGap(3).text(stripInline(line.slice(4)), { width: contentWidth });
      doc.moveDown(0.32);
      seenFirstHeading = true;
      continue;
    }
    if (line.startsWith("## ")) {
      ensure(68);
      doc.moveDown(0.75);
      doc.fillColor(colors.green).font("NotoBold").fontSize(7.8).text("SECTION", { width: contentWidth, characterSpacing: 1 });
      doc.moveDown(0.5);
      doc.fillColor(colors.ink).font("NotoBold").fontSize(16).lineGap(3.6).text(stripInline(line.slice(3)), { width: contentWidth });
      doc.moveDown(0.42);
      seenFirstHeading = true;
      continue;
    }
    if (line.startsWith("> ")) {
      ensure(80);
      const quote = stripInline(line.slice(2));
      const quoteHeight = doc.heightOfString(quote, { width: contentWidth - 34, lineGap: 4.6 });
      const y = doc.y;
      doc.save().strokeColor(colors.green).lineWidth(2.4).moveTo(PAGE.left, y).lineTo(PAGE.left, y + quoteHeight + 15).stroke().restore();
      doc.fillColor(colors.ink).font("Noto").fontSize(12).lineGap(4.6).text(quote, PAGE.left + 22, y + 3, { width: contentWidth - 34 });
      doc.y = y + quoteHeight + 21;
      continue;
    }
    ensure(40);
    doc.fillColor(colors.ink).font("Noto").fontSize(10).lineGap(4.5).text(stripInline(line), { width: contentWidth });
    doc.moveDown(0.34);
    seenFirstHeading = true;
  }
  flushBullets();

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fillColor(colors.muted).font("Noto").fontSize(7).text(`Neo.K × EveMissLab   ·   ${paper.id}`, PAGE.left, PAGE.height - 31, { lineBreak: false });
    doc.text(`${i + 1} / ${range.count}   ·   https://thisoneisneok.com`, PAGE.left, PAGE.height - 31, { width: contentWidth, align: "right", lineBreak: false });
    doc.page.margins.bottom = originalBottomMargin;
  }
  doc.end();
  return new Promise((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });
}

fs.mkdirSync(outputDir, { recursive: true });

let done = 0;
let missing = 0;
for (const group of series) {
  for (const paper of group.papers) {
    const sourcePath = paper.sourceFile ? path.join(root, paper.sourceFile) : null;
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      console.warn(`[pdf] no source for ${paper.id} — ${paper.sourceFile ?? "(no sourceFile in manifest)"}`);
      missing += 1;
      continue;
    }
    await render(path.join(outputDir, `${paper.slug}.pdf`), paper, bodyOf(sourcePath));
    done += 1;
  }
}
console.log(`Rendered ${done} paper PDFs${missing ? `, ${missing} MISSING SOURCE` : ""}.`);
if (missing) process.exit(1);
