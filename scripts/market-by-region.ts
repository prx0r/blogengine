// Run market scan for specific regions
import { YouTubeDataClient } from "../src/lib/video-objects/youtube-data";

const REGIONS = ["ES", "MX", "AR", "CO", "CL", "IN"];
const QUERIES = [
  "alchemy philosophy explained",
  "hermetic philosophy",
  "emerald tablet explained",
  "alchemy spiritual transformation",
  "Kashmir Shaivism philosophy",
  "36 tattvas explained",
  "tantric philosophy non-duality",
  "Abhinavagupta explained",
  "neoplatonism explained",
  "theurgy explained",
  "Socrates daimon explained",
  "holy guardian angel explained",
];

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Set YOUTUBE_API_KEY");

  const client = new YouTubeDataClient(apiKey);

  for (const region of REGIONS) {
    console.log(`\n======= REGION: ${region} =======`);
    try {
      const snapshot = await client.discoverMarket(QUERIES, {
        regionCode: region,
        maxResultsPerQuery: 5,
        maxReferences: 10,
        now: new Date(),
      });
      const breakouts = snapshot.references.filter((r) => r.breakout.is_breakout);
      console.log(`  Total: ${snapshot.references.length} videos, ${breakouts.length} breakouts`);
      for (const b of breakouts.slice(0, 5)) {
        console.log(`  ▶ ${b.title} — ${b.channel_title}`);
        console.log(`    ${b.view_count} views, ${b.views_per_day}/day, ${Math.round(b.duration_seconds/60)}min`);
      }
      if (breakouts.length === 0) {
        // Show top results anyway
        for (const r of snapshot.references.slice(0, 3)) {
          console.log(`  ${r.title} — ${r.channel_title} (${r.view_count} views)`);
        }
      }
    } catch (e) {
      console.error(`  Error: ${e.message}`);
    }
  }
}

main().catch(console.error);
