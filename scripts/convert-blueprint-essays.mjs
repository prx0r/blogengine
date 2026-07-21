import fs from "node:fs";
import path from "node:path";

const BLUEPRINTS = {
  iamblichus: {
    dir: "essayglobal/blueprints/Iamblichus - On the Mysteries",
    subdirs: [
      "01-the-priest-replies",
      "02-the-ladder-of-beings",
      "03-how-to-read-epiphany",
      "04-dreams-possession-divination",
      "05-theurgy-is-not-coercion",
      "06-why-matter-can-save",
      "07-mud-lotus-sacred-names",
      "08-fate-daemon-union",
    ],
    source_id: "iamblichus_mysteries",
    author: "Iamblichus",
    book_id: "iamblichus-on-the-mysteries",
  },
  corbin_alone: {
    dir: "essayglobal/blueprints/Corbin - Alone with the Alone",
    subdirs: [
      "01-the-map-the-veil-the-method",
      "02-the-god-who-longs-to-be-known",
      "03-sophia-in-mecca",
      "04-creation-is-not-an-object",
      "05-the-heart-that-makes-worlds-real",
      "06-when-man-prays-god-into-presence",
      "07-the-face-that-cannot-be-seen",
    ],
    source_id: "corbin_alone_with_alone",
    author: "Henry Corbin",
    book_id: "corbin-alone-with-the-alone",
  },
};

function mdToBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let currentPara = [];

  function flush() {
    if (!currentPara.length) return;
    const text = currentPara.join("\n").trim();
    if (text) blocks.push({ kind: "ai", text });
    currentPara = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip title line
    if (/^#\s/.test(line) && blocks.length === 0 && currentPara.length === 0) continue;

    // Subheadings
    if (/^#{2,3}\s/.test(line)) {
      flush();
      blocks.push({ kind: "ai", text: line.replace(/^#+\s*/, "").trim() });
      continue;
    }

    // Horizontal rule
    if (/^---/.test(line)) {
      flush();
      continue;
    }

    // Blockquote
    if (/^>/.test(line)) {
      flush();
      const quoteLines = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      i--;
      const text = quoteLines.join("\n").trim();
      if (text) blocks.push({ kind: "source", text });
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      flush();
      continue;
    }

    // Regular text
    currentPara.push(line);
  }

  flush();
  return blocks;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_|_$/g, "");
}

for (const [key, cfg] of Object.entries(BLUEPRINTS)) {
  const root = path.resolve(process.cwd(), cfg.dir);
  const essays = [];

  for (const subdir of cfg.subdirs) {
    const essayPath = path.join(root, subdir, "essay.md");
    if (!fs.existsSync(essayPath)) {
      console.warn(`Missing: ${essayPath}`);
      continue;
    }

    const md = fs.readFileSync(essayPath, "utf-8");
    const titleLine = md.split("\n")[0].replace(/^#\s*/, "").trim();
    const id = slugify(titleLine);
    const fullId = `${key}_${id}`;

    const body = mdToBlocks(md);

    const essay = {
      id: fullId,
      title: titleLine,
      type: "condensed_source",
      source_ids: [cfg.source_id],
      author: cfg.author,
      concepts: [],
      prerequisites: [],
      body,
    };

    const outPath = path.join(process.cwd(), "content", "glossary", "essays", `${fullId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(essay, null, 2));
    console.log(`  → ${fullId}: ${titleLine} (${body.length} blocks, ${md.length}c)`);

    essays.push({
      id: fullId,
      title: titleLine,
      audioUrl: `/audio/${fullId}.mp3`,
    });
  }

  const album = {
    id: cfg.book_id,
    title: key === "iamblichus" ? "On the Mysteries" : "Alone with the Alone",
    author: cfg.author,
    description: key === "iamblichus"
      ? "A complete companion to Iamblichus' On the Mysteries — 8 essays on theurgy, sacred names, divination, and the soul's return to the divine."
      : "A complete companion to Henry Corbin's Alone with the Alone — 7 essays on creative imagination, theophanic desire, and the God who longs to be known.",
    coverImage: "/images/books/placeholder.jpg",
    essays,
  };

  const albumPath = path.join(process.cwd(), "content", "glossary", "books", `${cfg.book_id}.json`);
  fs.writeFileSync(albumPath, JSON.stringify(album, null, 2));
  console.log(`  📚 Album: ${cfg.book_id} (${essays.length} essays)`);
}

console.log("\nDone.");
