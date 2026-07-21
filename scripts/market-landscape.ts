import { YouTubeDataClient } from "../src/lib/video-objects/youtube-data";
import type { MarketSnapshot } from "../src/lib/video-objects/types";

interface ThemeQuery {
  theme: string;
  queries: string[];
  ros: string[];
}

const THEMES: ThemeQuery[] = [
  {
    theme: "Tantra & Kashmir Shaivism",
    queries: [
      "Kashmir Shaivism philosophy explained",
      "Abhinavagupta Tantra consciousness",
      "36 tattvas explained",
      "tantric philosophy non-duality",
    ],
    ros: [
      "ro:tantraloka-consciousness-states", "ro:tantraloka-cosmology",
      "ro:tantraloka-three-means", "ro:tantraloka-twelve-kalis",
      "ro:lakshmanjoo-vijnana-bhairava", "ro:lakshmanjoo-shiva-sutras",
      "ro:dyczkowski-doctrine-vibration", "ro:layayoga-subtle-body",
    ],
  },
  {
    theme: "Alchemy Philosophy",
    queries: [
      "alchemy philosophical meaning",
      "hermetic philosophy explained",
      "emerald tablet explained",
      "alchemy spiritual transformation",
    ],
    ros: [
      "ro:alchemy-emerald-tablet", "ro:alchemy-atalanta",
      "ro:alchemy-khunrath", "ro:alchemy-blake-marriage",
      "ro:corpus-hermeticum", "ro:alchemy-paracelsus-aurora",
    ],
  },
  {
    theme: "Neoplatonism & Proclus",
    queries: [
      "neoplatonism explained",
      "Proclus philosophy",
      "Plotinus explained",
      "theurgy explained",
    ],
    ros: [
      "ro:proclus-elements", "ro:proclus-hymns-berg",
      "ro:iamblichean-theurgy", "ro:shaw-theurgy",
      "ro:chaldean-oracles", "ro:daimon-platonist",
    ],
  },
  {
    theme: "Daimon & Spirit Guidance",
    queries: [
      "holy guardian angel explained",
      "daimon spirit guide philosophy",
      "Socrates daimon explained",
      "how to contact your spirit guide",
    ],
    ros: [
      "ro:daimon-guidance", "ro:daimon-socratic",
      "ro:daimon-hga", "ro:daimon-theurgic",
      "ro:daimon-platonist", "ro:ficino-daimon",
      "ro:daimon-luminous-body",
    ],
  },
  {
    theme: "Consciousness & Physics",
    queries: [
      "hard problem of consciousness",
      "panpsychism explained",
      "free energy principle explained",
      "quantum consciousness theory",
    ],
    ros: [
      "ro:friston-free-energy", "ro:penrose-orch-or",
      "ro:tegmark-perceptronium", "ro:qri-qualia",
      "ro:fields3", "ro:barandes-foundations",
    ],
  },
  {
    theme: "Buddhist Philosophy",
    queries: [
      "Nagārjuna emptiness explained",
      "Buddhist philosophy non-self",
      "Nanavira Thera dependent arising",
      "early Buddhism consciousness",
    ],
    ros: [
      "ro:nagarjuna-mulamadhyamaka", "ro:nanavira-clearing-path",
      "ro:nanananda-papanca", "ro:dhammapada",
      "ro:satipatthana-sutta", "ro:fire-sermon",
    ],
  },
  {
    theme: "Literature as Initiation",
    queries: [
      "Divine Comedy philosophical meaning",
      "Odyssey symbolic meaning",
      "Lord of the Rings spiritual meaning",
      "Dante initiation explained",
    ],
    ros: [
      "ro:literature-divine-comedy", "ro:literature-odyssey",
      "ro:literature-lord-of-the-rings", "ro:literature-gilgamesh",
      "ro:literature-moby-dick", "ro:literature-brothers-karamazov",
    ],
  },
  {
    theme: "Western Occult & Magick",
    queries: [
      "practical magick explained",
      "grimoire how it works",
      "ceremonial magick beginner",
      "thelema crowley explained",
    ],
    ros: [
      "ro:crowley-magick", "ro:crowley-cosmology",
      "ro:path-abramelin", "ro:path-pgm",
      "ro:path-samekh", "ro:path-acher",
    ],
  },
  {
    theme: "Yoga Philosophy Origins",
    queries: [
      "yoga philosophy beyond poses",
      "yoga sutras explained",
      "bhagavad gita philosophy",
      "upanishads explained simply",
    ],
    ros: [
      "ro:yoga-sutras", "ro:bhagavad-gita",
      "ro:upanishads", "ro:yoga-vasistha",
      "ro:tao-te-ching", "ro:brahma-sutras",
    ],
  },
  {
    theme: "Sufi & Illuminationist",
    queries: [
      "Suhrawardi illumination philosophy",
      "Ibn Arabi unity of being",
      "Henry Corbin imaginal world",
      "sufi philosophy explained",
    ],
    ros: [
      "ro:suhrawardi-illumination", "ro:ibn-arabi-perfect-man",
      "ro:corbin-imaginal-expanded", "ro:corbin-imaginal",
      "ro:voss-imagination-divination",
    ],
  },
  {
    theme: "Morphic Fields & Bioelectricity",
    queries: [
      "michael levin bioelectricity",
      "morphogenesis explained",
      "basal cognition theory",
      "biological memory body",
    ],
    ros: [
      "ro:levin-basal-cognition", "ro:morphospace",
      "ro:complexity", "ro:assembly-theory",
    ],
  },
  {
    theme: "Afterlife & Death Systems",
    queries: [
      "tibetan book of death",
      "afterlife near death experience",
      "egyptian book of dead explained",
      "consciousness after death",
    ],
    ros: [
      "ro:death-systems-convergence", "ro:six-yogas-naropa",
      "ro:tantraloka-vol10", "ro:law-of-one",
      "ro:cassiopaean",
    ],
  },
];

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface CategoryResult {
  theme: string;
  total_results: number;
  breakout_count: number;
  breakouts: Array<{
    title: string;
    channel: string;
    views: number;
    views_per_day: number;
    breakout_ratio: number | null;
    age_days: number;
    duration_seconds: number;
  }>;
  avg_views_per_day: number;
  avg_duration: number;
  small_channel_breakouts: number;
  queries_used: string[];
}

async function main(): Promise<void> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Set YOUTUBE_API_KEY");

  const client = new YouTubeDataClient(apiKey);
  const results: CategoryResult[] = [];

  for (const theme of THEMES) {
    console.log(`\n=== ${theme.theme} ===`);
    process.stdout.write("  Searching...");

    const snapshot: MarketSnapshot = await client.discoverMarket(theme.queries, {
      regionCode: "US",
      maxResultsPerQuery: 10,
      maxReferences: 15,
      now: new Date(),
    });

    const breakouts = snapshot.references.filter((r) => r.breakout.is_breakout);
    const smallChannelBreakouts = snapshot.references.filter(
      (r) => r.breakout.is_breakout && (r.channel_baseline.subscriber_count ?? Infinity) < 50000,
    );
    const avgViews = snapshot.references.length > 0
      ? snapshot.references.reduce((s, r) => s + r.views_per_day, 0) / snapshot.references.length
      : 0;
    const avgDuration = snapshot.references.length > 0
      ? snapshot.references.reduce((s, r) => s + r.duration_seconds, 0) / snapshot.references.length
      : 0;

    const categoryResult: CategoryResult = {
      theme: theme.theme,
      total_results: snapshot.references.length,
      breakout_count: breakouts.length,
      breakouts: breakouts.map((r) => ({
        title: r.title,
        channel: r.channel_title,
        views: r.view_count,
        views_per_day: r.views_per_day,
        breakout_ratio: Math.max(r.breakout.views_ratio ?? 0, r.breakout.velocity_ratio ?? 0),
        age_days: r.age_days,
        duration_seconds: r.duration_seconds,
      })),
      avg_views_per_day: Math.round(avgViews),
      avg_duration: Math.round(avgDuration / 60),
      small_channel_breakouts: smallChannelBreakouts.length,
      queries_used: snapshot.search_queries,
    };
    results.push(categoryResult);

    console.log(` ${snapshot.references.length} videos, ${breakouts.length} breakouts, ${smallChannelBreakouts.length} from small channels`);
    for (const b of breakouts.slice(0, 5)) {
      console.log(`  ▶ ${b.title} — ${b.channel} (${(b.view_count / 1000).toFixed(1)}k views, ${b.views_per_day.toFixed(0)}/day)`);
    }
  }

  // Write report
  const report = {
    scanned_at: new Date().toISOString(),
    total_themes: results.length,
    total_videos_analyzed: results.reduce((s, r) => s + r.total_results, 0),
    total_breakouts: results.reduce((s, r) => s + r.breakout_count, 0),
    themes: results,
    insights: {
      most_breakouts: [...results].sort((a, b) => b.breakout_count - a.breakout_count).slice(0, 3).map((r) => r.theme),
      most_small_channel_opportunity: [...results].sort((a, b) => b.small_channel_breakouts - a.small_channel_breakouts).slice(0, 3).map((r) => r.theme),
      best_avg_views: [...results].sort((a, b) => b.avg_views_per_day - a.avg_views_per_day).slice(0, 3).map((r) => r.theme),
    },
  };

  const fs = await import("node:fs");
  const path = await import("node:path");
  fs.writeFileSync(
    path.resolve("content/video-objects/market-landscape.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(`\nReport: content/video-objects/market-landscape.json`);
}

main().catch(console.error);
