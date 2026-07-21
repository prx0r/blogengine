import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const EMBLEM_BASE = "content/sources/occult/alchemy/emblems";
const ART_DIR = "content/glossary/art";

const CONCEPT_RULES = [
  { match: /fludd|macrocosm|microcosm|cosmi|utriusque/i, concepts: ["Unity", "Imaginal World"], motifs: ["cosmos", "macrocosm"], entities: ["macrocosm", "microcosm"], mood: ["cosmic"], palette: ["monochrome"] },
  { match: /hermaphrodite|coniunctio|alchemical wedding|king and queen|sun and moon|union|rosarium/i, concepts: ["Conjunction", "Opposites", "Unity"], motifs: ["hermaphrodite", "sun_moon"], entities: ["hermaphrodite", "king", "queen", "rebis", "conjunctio"], mood: ["symbolic"], palette: ["monochrome", "gold"] },
  { match: /raven|skull|putrefaction|death|dissolution|tomb/i, concepts: ["Purification", "Transformation"], motifs: ["skull", "raven", "darkness"], entities: ["raven", "skull"], mood: ["austere"], palette: ["monochrome", "dark"] },
  { match: /vessel|athanor|furnace|egg|philosophical egg|hermetic vessel|alembic/i, concepts: ["Sacred Matter", "Transformation"], motifs: ["vessel", "furnace", "philosophical_egg"], entities: ["athanor", "alembic", "hermetic_vessel"], mood: ["contemplative"], palette: ["monochrome", "sepia"] },
  { match: /green lion|chymical|urbiger/i, concepts: ["Transformation", "Energy"], motifs: ["green_lion"], entities: ["green_lion"], mood: ["mystical"], palette: ["monochrome"] },
  { match: /ouroboros|serpent|dragon|snake/i, concepts: ["Unity", "Correspondence", "Transformation"], motifs: ["ouroboros", "serpent", "dragon"], entities: ["ouroboros", "dragon", "serpent"], mood: ["mystical"], palette: ["monochrome"] },
  { match: /distillation|sublimation|digestion|evaporation/i, concepts: ["Purification", "Transformation"], motifs: ["distillation"], entities: ["alembic", "distillation_apparatus"], mood: ["contemplative"], palette: ["monochrome"] },
  { match: /tree|arbor|branch|root/i, concepts: ["Ascent", "Transformation"], motifs: ["tree_of_life"], entities: ["philosophical_tree"], mood: ["contemplative"], palette: ["monochrome"] },
  { match: /phoenix|pelican|peacock|rainbow|cauda pavonis/i, concepts: ["Transformation", "Beauty"], motifs: ["phoenix", "peacock"], entities: ["phoenix", "pelican", "peacock"], mood: ["visionary"], palette: ["gold", "red", "green"] },
  { match: /rose|rosicrucian|rosy cross|cross|chymical wedding|maier|rosenkreutz|themis/i, concepts: ["Unity", "Imagination", "Perception"], motifs: ["rose_cross", "rosicrucian"], entities: ["rose", "cross", "chymical_wedding"], mood: ["mystical"], palette: ["monochrome", "gold", "red"] },
  { match: /angel|gabriel|raphael|heavenly|celestial|divine/i, concepts: ["Imaginal World", "Ascent"], motifs: ["angel", "celestial"], entities: ["angel"], mood: ["visionary", "sacred"], palette: ["monochrome", "gold"] },
  { match: /astrolog|planet|sign|zodiac|horoscope|star/i, concepts: ["Correspondence", "Divine Order"], motifs: ["astrology", "stars"], entities: ["astrologer", "zodiac", "planet"], mood: ["contemplative"], palette: ["monochrome"] },
  { match: /paracels|aurora|spagyric|coelum/i, concepts: ["Transformation", "Divine Power"], motifs: ["spagyric"], entities: ["paracelsus"], mood: ["mystical"], palette: ["monochrome"] },
  { match: /khunrath|amphitheatrum|oratory/i, concepts: ["Unity", "Imaginal World"], motifs: ["oratory"], entities: ["khunrath"], mood: ["visionary", "sacred"], palette: ["monochrome", "gold"] },
  { match: /mercury|mercurial|caduceus|hermes|thoth|quicksilver/i, concepts: ["Transformation", "Correspondence"], motifs: ["mercury", "caduceus"], entities: ["mercury_god", "caduceus"], mood: ["mystical"], palette: ["monochrome", "gold"] },
  { match: /splendor solis|trismosin|illuminated/i, concepts: ["Beauty", "Transformation", "Sacred Matter"], motifs: ["illuminated_manuscript", "splendor_solis"], entities: ["splendor_solis"], mood: ["visionary", "illuminated"], palette: ["gold", "blue", "red", "green"] },
  { match: /laboratory|alchemist|smith|workshop|experiment/i, concepts: ["Transformation", "Purification"], motifs: ["laboratory"], entities: ["alchemist", "laboratory"], mood: ["contemplative"], palette: ["sepia", "monochrome"] },
  { match: /seven|planet|metal|saturn|jupiter|mars|venus/i, concepts: ["Correspondence", "Divine Power"], motifs: ["planetary", "seven_metals"], entities: ["planetary_symbol"], mood: ["contemplative"], palette: ["monochrome"] },
  { match: /light|sun|ray|illuminat|dawn|bright|shine/i, concepts: ["Beauty", "Perception", "Ascent"], motifs: ["light_ray", "sun"], entities: ["sun_rays", "light"], mood: ["illuminatory"], palette: ["gold", "white"] },
  { match: /night|dark|shadow|eclipse|gloom/i, concepts: ["Purification", "Transformation"], motifs: ["darkness", "night"], entities: ["night", "shadow"], mood: ["austere"], palette: ["dark", "monochrome"] },
  { match: /rip|tomb|cantilena|bosom book|gate|scroll/i, concepts: ["Transformation", "Ascent", "Sacred Matter"], motifs: ["alchemical_scroll"], entities: ["george_ripley", "ripley_scroll"], mood: ["mystical"], palette: ["sepia", "monochrome"] },
  { match: /frontispiece|title|plate/i, concepts: ["Imagination", "Beauty"], motifs: ["frontispiece", "book_art"], entities: ["frontispiece"], mood: ["antique"], palette: ["sepia", "monochrome"] },
  { match: /king|queen|crown|throne|emperor|royal/i, concepts: ["Conjunction", "Opposites", "Divine Order"], motifs: ["royalty"], entities: ["king", "queen"], mood: ["sacred"], palette: ["gold", "monochrome"] },
  { match: /temple|church|cathedral|shrine|altar|sanctuary/i, concepts: ["Sacred Matter", "Imaginal World"], motifs: ["temple", "sacred_space"], entities: ["temple"], mood: ["sacred", "contemplative"], palette: ["sepia", "monochrome"] },
  { match: /water|sea|ocean|river|wave|flood|moist/i, concepts: ["Purification", "Transformation"], motifs: ["water", "sea"], entities: ["water", "sea"], mood: ["contemplative"], palette: ["monochrome", "blue"] },
  { match: /mountain|hill|rock|stone|earth|ground/i, concepts: ["Sacred Matter", "Stability"], motifs: ["mountain", "earth"], entities: ["mountain", "stone"], mood: ["contemplative"], palette: ["sepia", "monochrome"] },
  { match: /allegori|emblem|symbol|figure|image|device|hieroglyph/i, concepts: ["Imagination", "Correspondence"], motifs: ["emblem", "symbol"], entities: ["emblem", "allegorical_figure"], mood: ["mystical"], palette: ["monochrome"] },
  { match: /baptism|purify|cleanse|wash|bath|ablution/i, concepts: ["Purification"], motifs: ["water", "cleansing"], entities: ["baptismal_font"], mood: ["sacred"], palette: ["monochrome", "blue"] },
  { match: /marriage|wedding|bride|groom|spouse|nuptial/i, concepts: ["Conjunction", "Opposites"], motifs: ["wedding", "marriage"], entities: ["bride", "groom"], mood: ["sacred", "mystical"], palette: ["gold", "monochrome"] },
];

const GALLERY_THEMES = {
  1: { style: ["engraving", "renaissance"], mood: ["antique", "contemplative"], color: ["sepia", "monochrome"], composition: ["single_figure", "diagrammatic"] },
  2: { style: ["engraving", "baroque"], mood: ["mystical", "symbolic"], color: ["sepia", "monochrome", "gold"], composition: ["emblematic", "symbolic"] },
  3: { style: ["engraving", "renaissance", "kabbalistic"], mood: ["cosmic", "visionary"], color: ["sepia", "monochrome", "gold"], composition: ["diagrammatic", "cosmic"] },
  4: { style: ["engraving", "renaissance"], mood: ["contemplative", "austere"], color: ["sepia", "monochrome", "dark"], composition: ["narrative", "diagrammatic"] },
  5: { style: ["engraving", "baroque"], mood: ["mystical", "visionary"], color: ["sepia", "monochrome", "gold", "red"], composition: ["emblematic", "symbolic"] },
  6: { style: ["engraving", "paracelsian"], mood: ["mystical", "contemplative"], color: ["sepia", "monochrome", "gold", "blue"], composition: ["diagrammatic", "single_figure"] },
  7: { style: ["engraving", "rosicrucian", "kabbalistic"], mood: ["mystical", "visionary", "sacred"], color: ["sepia", "monochrome", "gold", "red"], composition: ["emblematic", "symbolic"] },
  8: { style: ["illuminated_manuscript", "renaissance"], mood: ["visionary", "illuminated", "mystical"], color: ["gold", "blue", "red", "green"], composition: ["emblematic", "illuminated"] },
};

function extractArtist(caption) {
  const patterns = [
    /from\s+([A-Z][a-zéë]+(?:\s+(?:von|van|de|della|d'|del|da|Ammonius|Hermes)\s+[A-Z][a-zéë]+)?(?:\s*(?:[,;:]|\s+(?:and|&)\s+|\s+the\s+))?)/i,
    /by\s+([A-Z][a-zéë]+(?:\s+[A-Z][a-zéë]+)?)/,
    /after\s+([A-Z][a-zéë]+(?:\s+[A-Z][a-zéë]+)?)/,
    /(?:\/|–|—)\s*([A-Z][a-zéë]+(?:\s+[A-Z][a-zéë]+)?)(?:\s*,|\s*\))/,
  ];
  for (const p of patterns) {
    const m = caption.match(p);
    if (m) {
      const name = m[1].replace(/[,;:].*$/, "").trim();
      if (name.length > 3 && name.length < 40) return name;
    }
  }
  return "";
}

function extractYear(caption) {
  const m = caption.match(/\b(1[0-9]{3}|1[0-9]{2}[0-9])\b/);
  return m ? parseInt(m[1]) : 0;
}

function classifyImage(caption, galleryNum) {
  const gallery = GALLERY_THEMES[galleryNum] || GALLERY_THEMES[1];
  const concepts = new Set();
  const motifs = new Set();
  const entities = new Set();
  let mood = [...gallery.mood];
  let palette = [...gallery.color];
  let compType = gallery.composition[0];

  for (const rule of CONCEPT_RULES) {
    if (rule.match.test(caption)) {
      rule.concepts.forEach(c => concepts.add(c));
      rule.motifs?.forEach(m => motifs.add(m));
      rule.entities?.forEach(e => entities.add(e));
      if (rule.mood) mood = [...new Set([...mood, ...rule.mood])];
      if (rule.palette) palette = [...new Set([...palette, ...rule.palette])];
    }
  }

  if (concepts.size === 0) {
    concepts.add("Transformation");
    concepts.add("Imagination");
  }

  if (motifs.size === 0) motifs.add("emblem");

  const clean = caption.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();
  const numWords = clean.split(/\s+/).length;
  if (numWords < 15) compType = "single_figure";
  else if (caption.match(/diagram|chart|map|table|scheme|figure/i)) compType = "diagrammatic";
  else if (caption.match(/allegori|emblem|device|symbol|icon/i)) compType = "emblematic";
  else compType = "single_figure";

  return {
    concepts: [...concepts],
    motifs: [...motifs],
    entities: [...entities],
    mood: mood.slice(0, 4),
    palette: palette.slice(0, 4),
    composition: compType,
  };
}

let total = 0;
for (let g = 1; g <= 8; g++) {
  const dir = join(EMBLEM_BASE, `gallery-${g}`);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter(f => f.endsWith(".json"));

  for (const f of files) {
    const meta = JSON.parse(readFileSync(join(dir, f), "utf-8"));
    const num = parseInt(meta.file.replace(/\D/g, ""));
    const id = `art_alchemy_e${String(num).padStart(3, "0")}`;
    const cleanCaption = meta.caption.replace(/<[^>]+>/g, "").trim();
    const { concepts, motifs, entities, mood, palette, composition } = classifyImage(meta.caption, g);
    const artist = extractArtist(meta.caption);
    const year = extractYear(meta.caption);

    const title = cleanCaption.length > 80 ? cleanCaption.slice(0, 77) + "..." : cleanCaption;

    const art = {
      id,
      title,
      artist,
      date: year ? String(year) : "",
      source_url: "https://www.alchemywebsite.com",
      image_url: `/art/alchemy/gallery-${g}/${meta.file}`,
      local_file: `content/sources/occult/alchemy/emblems/gallery-${g}/${meta.file}`,
      license: "Public Domain",
      description: cleanCaption,
      original_metadata: {
        file: meta.file,
        caption: meta.caption,
        source: meta.source,
        gallery: meta.gallery,
        gallery_position: num,
      },
      concepts,
      visual_motifs: motifs,
      style: GALLERY_THEMES[g].style,
      used_in: [],
      motion_notes: ["slow_zoom"],
      notes: `Gallery ${g}, position ${num}/320. From ${meta.source}.`,
      mood,
      color_palette: palette,
      entities_depicted: entities,
      composition,
    };

    writeFileSync(join(ART_DIR, `${id}.json`), JSON.stringify(art, null, 2));
    total++;
  }
}

// Build concept index
const conceptIndex = {};
for (let g = 1; g <= 8; g++) {
  const dir = join(EMBLEM_BASE, `gallery-${g}`);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter(f => f.endsWith(".json"));
  for (const f of files) {
    const meta = JSON.parse(readFileSync(join(dir, f), "utf-8"));
    const num = parseInt(meta.file.replace(/\D/g, ""));
    const id = `art_alchemy_e${String(num).padStart(3, "0")}`;
    const { concepts } = classifyImage(meta.caption, g);
    for (const c of concepts) {
      if (!conceptIndex[c]) conceptIndex[c] = [];
      conceptIndex[c].push(id);
    }
  }
}

const manifest = {
  total,
  generated: new Date().toISOString(),
  source: "https://www.alchemywebsite.com — Adam McLean's Alchemy Web Site",
  galleries: {
    1: { count: readdirSync(join(EMBLEM_BASE, "gallery-1")).filter(f => f.endsWith(".json")).length, theme: "astrology, distillation, Fludd" },
    2: { count: readdirSync(join(EMBLEM_BASE, "gallery-2")).filter(f => f.endsWith(".json")).length, theme: "conjunctio, Rosarium, hermaphrodite" },
    3: { count: readdirSync(join(EMBLEM_BASE, "gallery-3")).filter(f => f.endsWith(".json")).length, theme: "macrocosm/microcosm, Khunrath, Fludd" },
    4: { count: readdirSync(join(EMBLEM_BASE, "gallery-4")).filter(f => f.endsWith(".json")).length, theme: "laboratory, Basil Valentine, Dee" },
    5: { count: readdirSync(join(EMBLEM_BASE, "gallery-5")).filter(f => f.endsWith(".json")).length, theme: "Ripley, Atalanta Fugiens, ouroboros" },
    6: { count: readdirSync(join(EMBLEM_BASE, "gallery-6")).filter(f => f.endsWith(".json")).length, theme: "Paracelsus, Böhme, spagyric" },
    7: { count: readdirSync(join(EMBLEM_BASE, "gallery-7")).filter(f => f.endsWith(".json")).length, theme: "Rosicrucian, Chymical Wedding" },
    8: { count: readdirSync(join(EMBLEM_BASE, "gallery-8")).filter(f => f.endsWith(".json")).length, theme: "Splendor Solis, illuminated" },
  },
  concept_index: Object.fromEntries(
    Object.entries(conceptIndex).sort((a, b) => b[1].length - a[1].length)
  ),
};

writeFileSync(join(ART_DIR, "_alchemy_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Generated ${total} art JSONs with concept index.`);
