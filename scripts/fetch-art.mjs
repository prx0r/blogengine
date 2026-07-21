// Art Ingestion System
// Fetches art from museum APIs, matches to essay concepts, stores in glossary

const API_CONFIG = {
  // Wikimedia Commons — best for alchemy, angels, manuscripts, occult diagrams
  commons: {
    base: "https://commons.wikimedia.org/w/api.php",
    search: (query) => ({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: 6,
      gsrlimit: 25,
      prop: "imageinfo|categories",
      iiprop: "url|mime|size|extmetadata",
      iiurlwidth: 800,
      format: "json",
      origin: "*",
    }),
  },

  // Wellcome Collection — best for alchemy, occult science, esoteric diagrams
  wellcome: {
    base: "https://api.wellcomecollection.org/catalogue/v2/works",
    search: (query) => ({
      query,
      include: "identifiers,items,images",
      "items.images.locations": "iiif-image",
      pageSize: 20,
    }),
  },

  // Met Museum — best for high-quality public-domain art
  met: {
    base: "https://collectionapi.metmuseum.org/public/collection/v1",
    search: async (query) => {
      const searchUrl = `${API_CONFIG.met.base}/search?hasImages=true&q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const ids = (searchData.objectIDs || []).slice(0, 20);
      const objects = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${API_CONFIG.met.base}/objects/${id}`);
          return res.json();
        })
      );
      return objects.filter((o) => o.isPublicDomain);
    },
  },

  // Art Institute of Chicago — strong metadata, IIIF images
  aic: {
    base: "https://api.artic.edu/api/v1/artworks",
    search: (query) => ({
      q: query,
      "query[term][is_public_domain]": true,
      fields:
        "id,title,artist_title,date_display,image_id,thumbnail,subject_titles,classification_titles,style_titles,place_of_origin",
      limit: 20,
    }),
    imageUrl: (imageId) =>
      `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`,
  },

  // Cleveland Museum of Art — CC0, direct image URLs
  cleveland: {
    base: "https://openaccess-api.clevelandart.org/api/artworks",
    search: (query) => ({
      q: query,
      has_image: 1,
      cc0: 1,
      limit: 20,
    }),
  },

  // Rijksmuseum — Dutch/European art, religious/alchemical engravings
  rijksmuseum: {
    base: "https://data.rijksmuseum.nl/search/collection",
    search: (query) => ({
      q: query,
      format: "json",
      imgonly: true,
      p: 1,
      ps: 20,
    }),
  },

  // Getty Museum — manuscripts, European painting, classical objects
  getty: {
    base: "https://data.getty.edu/museum/collection/objects/search",
    search: (query) => ({
      q: query,
      "has-image": true,
      page: { size: 20 },
    }),
  },
};

// Query seeds organized by essay domain
const QUERY_SEEDS = {
  alchemy: [
    "alchemy", "alchemical", "hermetic", "prima materia", "philosopher stone",
    "alchemical vessel", "athanor", "rosicrucian", "chymical",
  ],
  angels: [
    "angel", "archangel", "seraphim", "cherubim", "annunciation",
    "Gabriel", "Michael", "angelic hierarchy", "winged figure",
  ],
  cosmology: [
    "celestial spheres", "cosmology", "macrocosm", "microcosm",
    "zodiac", "astrology", "cosmic man", "world soul", "music of spheres",
  ],
  vision: [
    "visionary", "ecstasy", "divine light", "mandorla", "apocalypse",
    "revelation", "Ezekiel", "Jacob's ladder", "ascent",
  ],
  manuscripts: [
    "illuminated manuscript", "medieval manuscript", "Qazwini",
    "Scivias", "Hildegard", "bestiary", "herbal",
  ],
  neoplatonism: [
    "Plotinus", "neoplatonic", "emanation", "divine intellect",
    "theurgy", "henosis",
  ],
  ficino: [
    "Ficino", "Renaissance magic", "Renaissance Platonism",
    "orphic hymn", "spiritus mundi",
  ],
  iamblichus: [
    "Iamblichus", "theurgy", "neoplatonic ritual", "divine symbols",
    "Egyptian priest",
  ],
  corbin: [
    "Henry Corbin", "mundus imaginalis", "Suhrawardi", "Ibn Arabi",
    "imaginal world", "Persian angelology",
  ],
  goethe: [
    "Goethe", "Goethean", "color theory", "metamorphosis",
    "moritz", "romantic science",
  ],
  theurgy: [
    "theurgy", "sacred ritual", "divine invocation", "Chaldean oracles",
    "Egyptian magic", "ritual object",
  ],

  // New worlds for Ochema video series
  sufi: [
    "Ibn Arabi", "Suhrawardi illumination", "Rumi whirling dervish",
    "Islamic geometric", "Persian miniature", "Alhambra",
    "Islamic calligraphy", "moonlit garden",
  ],
  neoplatonic: [
    "Proclus", "Plotinus", "Plato academy", "neoplatonic school",
    "ancient Greek philosophy", "Athens academy", "Renaissance Platonism",
    "celestial spheres Ptolemy", "Ficino",
  ],
  hermetic: [
    "Hermes Trismegistus", "Corpus Hermeticum", "Hermetic",
    "medieval grimoire", "ritual magic", "John Dee",
    "Enochian", "alchemical emblem", "grimoire",
  ],
  buddhist_philosophy: [
    "Buddha statue", "Buddhist monastery India", "Nalanda ruins",
    "Bodhisattva sculpture", "Gandhara Buddha", "bamboo grove",
    "Buddhist stupa", "meditation Buddha", "ancient Buddhist art",
  ],
  yoga_philosophy: [
    "yogi meditation", "Himalayan mountain landscape", "ashram India",
    "sunrise mountain meditation", "Patañjali statue", "yoga sculpture India",
    "meditation cave", "sage meditation Himalayan", "Indian sage",
  ],
};

function generateId(title, source) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50);
  return `art_${source}_${slug}`;
}

function determineRights(obj) {
  if (obj.isPublicDomain) return { label: "public domain", confidence: "high" };
  if (obj.cc0) return { label: "CC0", confidence: "high" };
  if (obj.rights_label === "public domain") return { label: "public domain", confidence: "high" };
  return { label: "unknown", confidence: "low" };
}

export async function searchCommons(query) {
  const params = API_CONFIG.commons.search(query);
  const url = `${API_CONFIG.commons.base}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query?.pages || {};
  return Object.values(pages).map((p) => {
    const info = p.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    return {
      id: generateId(p.title, "commons"),
      title: p.title?.replace(/^File:/, ""),
      source_system: "commons",
      source_object_id: p.pageid,
      creator: meta.Artist?.value || null,
      date: meta.DateTimeOriginal?.value || null,
      source_page_url: `https://commons.wikimedia.org/wiki/${p.title}`,
      direct_image_url: info.url || null,
      thumbnail_url: info.thumburl || null,
      rights_label: meta.UsageTerms?.value || "unknown",
      rights_confidence: meta.UsageTerms?.value?.includes("public") ? "high" : "medium",
      raw_subjects: (p.categories || []).map((c) => c.title?.replace(/^Category:/, "")).filter(Boolean),
      raw_description: meta.ImageDescription?.value || null,
    };
  });
}

export async function searchWellcome(query) {
  const params = API_CONFIG.wellcome.search(query);
  const url = `${API_CONFIG.wellcome.base}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).map((w) => ({
    id: generateId(w.title || w.id, "wellcome"),
    title: w.title || "Untitled",
    source_system: "wellcome",
    source_object_id: w.id,
    creator: w.contributors?.[0]?.agent?.label || null,
    date: w.production?.[0]?.dates?.[0]?.label || null,
    source_page_url: `https://wellcomecollection.org/works/${w.id}`,
    direct_image_url: w.images?.[0]?.locations?.[0]?.url || null,
    iiif_manifest_url: w.identifiers?.[0]?.value
      ? `https://iiif.wellcomecollection.org/presentation/v2/${w.id}`
      : null,
    rights_label: w.images?.[0]?.locations?.[0]?.license?.url || "unknown",
    rights_confidence: "medium",
    raw_subjects: (w.subjects || []).map((s) => s.label),
    raw_description: w.description || null,
  }));
}

export async function searchMet(query) {
  try {
    const objects = await API_CONFIG.met.search(query);
    return (objects || []).filter(Boolean).map((o) => ({
      id: generateId(o.title, "met"),
      title: o.title || "Untitled",
      source_system: "met",
      source_object_id: o.objectID,
      creator: o.artistDisplayName || null,
      date: o.objectDate || null,
      culture_period: o.culture || o.period || null,
      source_page_url: o.objectURL,
      direct_image_url: o.primaryImage || null,
      rights_label: "public domain",
      rights_confidence: o.isPublicDomain ? "high" : "low",
      raw_subjects: (o.tags || []).map((t) => t.term),
      raw_description: [o.title, o.creditLine].filter(Boolean).join(" — "),
    }));
  } catch {
    return [];
  }
}

export async function searchAIC(query) {
  try {
    const url = `${API_CONFIG.aic.base}/search?${new URLSearchParams(API_CONFIG.aic.search(query))}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.data || []).map((a) => ({
      id: generateId(a.title, "aic"),
      title: a.title || "Untitled",
      source_system: "aic",
      source_object_id: a.id,
      creator: a.artist_title || null,
      date: a.date_display || null,
      source_page_url: `https://www.artic.edu/artworks/${a.id}`,
      direct_image_url: a.image_id ? API_CONFIG.aic.imageUrl(a.image_id) : null,
      iiif_image_base_url: a.image_id ? `https://www.artic.edu/iiif/2/${a.image_id}` : null,
      rights_label: "public domain",
      rights_confidence: "high",
      raw_subjects: a.subject_titles || [],
      raw_description: `${a.title} — ${a.artist_title || "Unknown"}`,
      culture_period: a.place_of_origin || null,
    }));
  } catch {
    return [];
  }
}

export async function searchCleveland(query) {
  try {
    const url = `${API_CONFIG.cleveland.base}?${new URLSearchParams(API_CONFIG.cleveland.search(query))}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.data || []).map((c) => ({
      id: generateId(c.title, "cleveland"),
      title: c.title || "Untitled",
      source_system: "cleveland",
      source_object_id: c.id,
      creator: c.creators?.[0]?.description || null,
      date: c.creation_date || null,
      culture_period: c.culture?.[0] || null,
      source_page_url: `https://www.clevelandart.org/art/${c.id}`,
      direct_image_url: c.images?.web?.url || null,
      rights_label: "CC0",
      rights_confidence: "high",
      raw_subjects: [c.type, c.department].filter(Boolean),
      raw_description: c.tombstone || null,
    }));
  } catch {
    return [];
  }
}

export async function searchAll(query) {
  const results = await Promise.allSettled([
    searchCommons(query).catch(() => []),
    searchWellcome(query).catch(() => []),
    searchMet(query).catch(() => []),
    searchAIC(query).catch(() => []),
    searchCleveland(query).catch(() => []),
  ]);
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export function getQuerySeeds(concepts) {
  const seeds = new Set();
  for (const concept of concepts) {
    const lower = concept.toLowerCase();
    for (const [domain, queries] of Object.entries(QUERY_SEEDS)) {
      if (lower.includes(domain) || domain.includes(lower)) {
        queries.forEach((q) => seeds.add(q));
      }
    }
    seeds.add(concept);
  }
  return [...seeds].slice(0, 10);
}

// CLI usage
async function main() {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const args = process.argv.slice(2);

  if (args[0] === "--test") {
    // Test mode
    const testQuery = args[1] || "alchemy angel";
    console.log(`\nTesting query: "${testQuery}"`);
    const results = await searchAll(testQuery);
    console.log(`\nTotal results: ${results.length}`);
    results.slice(0, 10).forEach((r) => {
      const img = r.direct_image_url ? r.direct_image_url.slice(0, 70) : "no image";
      console.log(`  [${r.source_system}] ${r.title.slice(0, 50)} | ${img}`);
    });
  } else if (args[0] === "--world" && args[1]) {
    // World mode: search all queries for a named world
    const worldName = args[1];
    const seeds = QUERY_SEEDS[worldName];
    if (!seeds) {
      console.error(`Unknown world: ${worldName}. Available: ${Object.keys(QUERY_SEEDS).join(", ")}`);
      process.exit(1);
    }
    console.log(`\nSearching world: ${worldName} (${seeds.length} queries)`);
    const allResults = [];
    for (const seed of seeds) {
      console.log(`  Query: "${seed}"`);
      const results = await searchAll(seed);
      console.log(`    → ${results.length} results`);
      allResults.push(...results);
    }
    // Deduplicate by image URL
    const seen = new Set();
    const unique = allResults.filter((r) => {
      const key = r.direct_image_url || r.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`\nTotal unique results: ${unique.length}`);
    unique.slice(0, 15).forEach((r) => {
      const img = r.direct_image_url ? r.direct_image_url.slice(0, 70) : "no image";
      console.log(`  [${r.source_system}] ${r.title.slice(0, 50)} | ${img}`);
    });
    // Save results to temp JSON for import
    const outPath = path.join(process.cwd(), "content", "video-objects", "seed-images", worldName, "museum-results.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(unique, null, 2));
    console.log(`\nSaved ${unique.length} results to ${path.relative(process.cwd(), outPath)}`);
  } else if (args[0]) {
    // Essay mode
    const essayId = args[0];
    const essayPath = path.join(process.cwd(), "content", "glossary", "essays", `${essayId}.json`);
    if (!fs.existsSync(essayPath)) {
      console.error(`Essay not found: ${essayId}`);
      process.exit(1);
    }
    const essay = JSON.parse(fs.readFileSync(essayPath, "utf-8"));
    const concepts = essay.concepts || [];
    const seeds = getQuerySeeds(concepts);
    console.log(`Searching for art for: ${essay.title}`);
    console.log(`Concepts: ${concepts.join(", ")}`);
    console.log(`Query seeds: ${seeds.join(", ")}`);

    for (const seed of seeds) {
      console.log(`\n--- ${seed} ---`);
      const results = await searchAll(seed);
      console.log(`Found ${results.length} results`);
      results.slice(0, 5).forEach((r) => {
        console.log(`  [${r.source_system}] ${r.title}`);
        if (r.direct_image_url) console.log(`    Image: ${r.direct_image_url.slice(0, 100)}`);
        if (r.creator) console.log(`    Creator: ${r.creator}`);
        if (r.rights_label) console.log(`    Rights: ${r.rights_label}`);
      });
    }
  } else {
    console.log("Usage:");
    console.log("  node scripts/fetch-art.mjs --test <query>        # Test a single query");
    console.log("  node scripts/fetch-art.mjs --world <world>       # Search all queries for a world");
    console.log("  node scripts/fetch-art.mjs <essay-id>            # Search for art matching an essay");
    console.log("\nAvailable worlds: " + Object.keys(QUERY_SEEDS).join(", "));
  }
}

if (process.argv[1]?.includes("fetch-art")) main();
