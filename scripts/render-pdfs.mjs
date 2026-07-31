import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const root = process.cwd();
const contentDir = path.join(root, "content", "blog");
const outputDir = path.join(root, "public", "pdf", "blog");
const fontDir = path.join(root, "node_modules", "@embedpdf", "fonts-tc", "fonts");
const regularFont = path.join(fontDir, "NotoSansHant-Regular.otf");
const boldFont = path.join(fontDir, "NotoSansHant-Bold.otf");
const PAGE = { width: 595.28, height: 841.89, left: 58, right: 58, top: 58, bottom: 48 };
const colors = { paper: "#F2EFE8", ink: "#171914", muted: "#676B62", green: "#315B53", line: "#C9C7BE", bright: "#D8FF65" };

function parseSource(filename) {
  const source = fs.readFileSync(path.join(contentDir, filename), "utf8");
  const end = source.indexOf("\n---\n", 4);
  const meta = {};
  for (const line of source.slice(4, end).split("\n")) {
    const split = line.indexOf(":");
    if (split < 0) continue;
    meta[line.slice(0, split).trim()] = line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return { meta, body: source.slice(end + 5).trim() };
}

function stripInline(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)");
}

function createDocument(target, meta, body) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right },
    bufferPages: true,
    info: { Title: meta.title, Author: "Neo.K", Subject: meta.description || "Personal log" },
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

  doc.fillColor(colors.green).font("NotoBold").fontSize(8).text("NEO.K / PERSONAL LOG", PAGE.left, PAGE.top, { width: contentWidth, characterSpacing: 1.35 });
  doc.moveDown(1.7);
  doc.fillColor(colors.ink).font("NotoBold").fontSize(27).lineGap(5).text(meta.title, { width: contentWidth });
  doc.moveDown(0.55);
  doc.fillColor(colors.muted).font("Noto").fontSize(9).lineGap(2).text(`${meta.date}   /   ${meta.tags || "PERSONAL NOTE"}`, { width: contentWidth });
  doc.moveDown(0.6);
  doc.fillColor(colors.green).fontSize(8).text(`ABSOLUTE URL  ·  ${meta.canonical}`, { width: contentWidth, link: meta.canonical, underline: false });
  doc.moveDown(1.4);
  doc.strokeColor(colors.line).lineWidth(0.6).moveTo(PAGE.left, doc.y).lineTo(PAGE.width - PAGE.right, doc.y).stroke();
  doc.moveDown(1.25);

  let bullets = [];
  const flushBullets = () => {
    for (const bullet of bullets) {
      ensure(34);
      const y = doc.y + 4;
      doc.fillColor(colors.green).circle(PAGE.left + 4, y + 4, 2.2).fill();
      doc.fillColor(colors.ink).font("Noto").fontSize(10.5).lineGap(4.8).text(stripInline(bullet), PAGE.left + 18, y, { width: contentWidth - 18 });
      doc.moveDown(0.3);
    }
    bullets = [];
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("# ")) { flushBullets(); continue; }
    if (line.startsWith("- ")) { bullets.push(line.slice(2)); continue; }
    flushBullets();
    if (line.startsWith("## ")) {
      ensure(70);
      doc.moveDown(0.8);
      doc.fillColor(colors.green).font("NotoBold").fontSize(8).text("SECTION", { width: contentWidth, characterSpacing: 1 });
      doc.moveDown(0.55);
      doc.fillColor(colors.ink).font("NotoBold").fontSize(17.5).lineGap(4).text(stripInline(line.slice(3)), { width: contentWidth });
      doc.moveDown(0.45);
      continue;
    }
    if (line.startsWith("> ")) {
      ensure(85);
      const quote = stripInline(line.slice(2));
      const quoteHeight = doc.heightOfString(quote, { width: contentWidth - 34, lineGap: 5 });
      const y = doc.y;
      doc.save().strokeColor(colors.green).lineWidth(2.5).moveTo(PAGE.left, y).lineTo(PAGE.left, y + quoteHeight + 16).stroke().restore();
      doc.fillColor(colors.ink).font("Noto").fontSize(13).lineGap(5).text(quote, PAGE.left + 22, y + 3, { width: contentWidth - 34 });
      doc.y = y + quoteHeight + 22;
      continue;
    }
    ensure(42);
    doc.fillColor(colors.ink).font("Noto").fontSize(10.5).lineGap(4.8).text(stripInline(line), { width: contentWidth });
    doc.moveDown(0.38);
  }
  flushBullets();

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fillColor(colors.muted).font("Noto").fontSize(7.2).text("Neo.K × EveMissLab", PAGE.left, PAGE.height - 31, { lineBreak: false });
    doc.text(`${i + 1} / ${range.count}   ·   https://thisoneisneok.com`, PAGE.left, PAGE.height - 31, { width: contentWidth, align: "right", lineBreak: false });
    doc.page.margins.bottom = originalBottomMargin;
  }
  doc.end();
}

fs.mkdirSync(outputDir, { recursive: true });
for (const filename of fs.readdirSync(contentDir).filter((name) => name.endsWith(".md")).sort()) {
  const { meta, body } = parseSource(filename);
  const target = path.join(outputDir, `${meta.slug}.${meta.locale}.pdf`);
  createDocument(target, meta, body);
  console.log(`Generated ${path.relative(root, target)}`);
}
