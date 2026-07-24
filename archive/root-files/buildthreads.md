# Build Threads — Directions from Here

## The Reality

We've designed ~80% of a media foundry in spec. We've validated about 20% with data. We have zero deployed Workers and zero published videos. Everything below is a thread that can be pulled independently — they don't all need to happen, and they don't need to happen in order.

---

## Thread A: Deploy the Farm (the critical path)

The shortest path to a running system producing real output.

```
farm-template/ → create-farm.sh → deployed Worker → daily research → first video
```

**Dependencies:** YouTube API key, Cloudflare Workers Paid ($5/mo), ~2 hours of focused work.
**Risks:** The Worker code is written but never deployed. The YouTube API client in `lib/` doesn't exist yet — it's stubs in `src/index.ts`. Those need to be written before the cron handlers do anything.
**Decides:** Whether our architecture actually works outside of spec documents.
**Exit condition:** One video published on YouTube. Everything else is speculative until this happens.

---

## Thread B: Title Science (highest immediate return, independent of A)

Analyze the Upworthy Research Archive (32k headline A/B tests) to produce a causal-validated title prior.

```
Download Upworthy CSV → parse experiments → extract semantic features 
→ train pairwise ranker → output: "for this topic frame, phrasing X beats Y"
```

**Can run today.** The dataset is ~50 MB. No deployment needed. Python on the VPS.
**Output:** A reusable title scoring function that the farm Worker calls during treatment generation.
**Risk:** Upworthy headlines are 2013-2015 US clickbait. The priors may not transfer to YouTube documentary titles. But within-experiment comparisons (same story, different headline) are causally valid even if the domain is different.
**Best reason to do it:** We can ship this in an afternoon, and it's the only thing in this entire project that gives us causal evidence about titles, not just observational correlation.

---

## Thread C: Blueprint Intelligence Datasets

Download and process the 8 Tier 1-2 datasets from `operations/blueprint-datasets-download.md`.

```
Upworthy ✓ → Clickstream → Met Museum → DPLA → SARIT → GoogleTrendArchive → Stack Exchange → Smithsonian
```

**All independent of Thread A.** Each dataset can be downloaded, processed, and queried without deploying anything.
**Output:** The six-packet system — demand, questions, contradiction, sources, visuals, narrative — per topic.
**Risk:** Dataset gravity. It's easy to spend weeks collecting and processing without ever using the output. The clickstream analysis (gateway graph) and museum asset graph are the most immediately useful. The rest can wait until a farm is running and requesting data.

---

## Thread D: Reddit Intelligence

Stream-filter 30 subreddits from Pushshift, upload to R2, run signal analysis.

```
Run scripts/reddit-extraction-guide.py → ~15 GB filtered Parquet → per-subreddit signals → question clusters
```

**Independent of A.** The dataset is already available on HuggingFace. Stream-filtering takes ~2-4 hours.
**Output:** Audience question clusters per topic, recommendation graphs, narrative frames.
**Risk:** Reddit's terms restrict commercial use. The extraction is for research purposes, but the output shouldn't be treated as validated demand. The peer review corrections (percentile normalization, deduplication, safety flags) must be applied before any production use.

---

## Thread E: Sanskrit Translation Pipeline

Download texts from Muktabodha + GRETIL, build a translation model or workflow.

```
Muktabodha e-texts → parallel corpus from Tantraloka dataset → fine-tune translation model 
→ translate under-translated texts (Vakyapadiya K3, Nyaya commentaries, unpublished Shaiva Tantras)
```

**Independent side project.** No dependency on the farm. Could become its own product.
**Output:** Translated Sanskrit texts that don't exist in English, plus a reusable translation pipeline for the farm's source verification step.
**Risk:** It's a research project in itself. The Tantraloda training dataset is 41 GB and requires agreeing to Dyczkowski's terms. Muktabodha texts need web scraping (they're not available via API).

---

## Thread F: Control Plane + Dashboard

Build the Dashboard Worker that reads from the global D1 and lets you approve/reject treatments, view farm status, and interrupt workflows.

```
global D1 schema → status ingest endpoint → dashboard UI → Cloudflare Access auth
```

**Depends on Thread A** — there's nothing to control until a farm is producing data.
**Can prototype independently:** Build the schema and ingest endpoints without a dashboard UI. A simple status endpoint that farms POST to is more important than a pretty UI.
**Output:** The approval inbox that keeps production moving without Slack/email/telegram hacks.

---

## Thread G: Redo A1-A3 as Tier 1 Validation

Run the OLS residual against an actual external outcome (future view growth from the YouNiverse time series), with proper bootstrap resampling, held-out channels, and multiple baselines.

```
YouNiverse time series → approximate video-level growth → compare OLS residual vs views/day 
vs age-bin percentile → Spearman r + top-quartile precision + bootstrap CI → publish as validated
```

**Can run today.** All data is in R2. The experiment design is spec'd in `operations/research-schema.md`.
**Output:** Either the OLS residual is validated as a breakout predictor, or we switch to views/day and move on.
**Value:** Closes the single biggest open question in the pipeline. The entire opportunity formula rests on this metric being meaningful, and we currently have only "different, not validated."

---

## Decision Map

```
                    ┌─────────────────────────────────────────────┐
                    │  Can we close any open threads without       │
                    │  deploying a farm?                           │
                    └─────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                                   ▼
              YES (Thread B, C, D, E, G)           NO (Thread A, F)
                    │                                   │
                    ▼                                   ▼
         Which produces the most            Deploy the farm.
         useful output per hour?             Everything else is
                │                            speculative until a
                ▼                            video is published.
         Thread B (Upworthy)
         ~2 hours → causal title prior.
         Immediate value for every
         video the farm will ever
         produce.
```

**Priority conflict:** Thread B (Upworthy title analysis) and Thread A (deploy farm) are not in tension — they're independent. Thread B produces a title prior that improves every video the farm will ever make, doesn't require deployment, and can be done in ~2 hours with just a CSV download. Thread A is the critical path to a running system but requires writing the YouTube API client first (~half a day). Do Thread B first (it's faster, it's useful), then Thread A (it unblocks everything).

**My recommendation:** Thread B (~2h today). Thread A (~half a day this week). Thread G as soon as someone runs it on the YouNiverse time series. Threads C, D, E are valuable but can wait until the farm is producing videos and requesting data. Thread F only matters after Thread A is live.

## Explicit Skip List (Do Not Work On)

These are parts of the spec that are designed but should not be invested in right now:

- **Content genome / global pattern library** — requires data from ≥2 running farms to have any signal. Building it now means populating it with guesses.
- **Shadow farm simulator** — requires a validated breakout metric AND own production data to calibrate. Currently neither exists.
- **Opportunity Exchange** — requires ≥2 farms to compete for topics. We have 0.
- **Farm Template Marketplace** — requires a working farm template first. We have an untested one.
- **Self-healing studio** — requires a running system that actually breaks. We have nothing to break yet.
- **33 not-started experiments from research-inventory.md** — most are blocked by "write the pipeline script and run it," but none of them unblock anything. The 3 priorities in this doc (B, A, G) are sufficient.
- **Dashboard UI polish** — the approval inbox is the only view that blocks work. Farm grid styling, animations, themes are waste.
- **Cross-farm analytics** — requires ≥2 farms. We have 0.
