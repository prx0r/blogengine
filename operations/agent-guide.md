# Agent Guide — Unwritten Rules, Context, and How to Actually Work Here

This is not a spec document. This is what I learned by doing, making mistakes, getting corrected, and watching what worked and didn't. Read it after HANDOVER.md but before touching any code.

---

## The Project's Real Identity

This is not a YouTube content farm. It's not a data pipeline. It's not a Cloudflare deployment. It's a **research laboratory disguised as a media company.** Every piece of infrastructure exists to answer one question: can we systematically identify intellectually underserved topics and produce documentaries about them that people want to watch?

The user (Thomas) is not trying to build a media empire. He's trying to build a system that *discovers what's worth making* — the production pipeline is almost incidental. Every time we spent too long on infrastructure without producing insight, the conversation stalled. Every time we produced an actual finding ("44% of labels differ," "Wikipedia has no signal," "the gap pattern is real"), the conversation accelerated.

**If you're choosing between building something and finding something, choose finding.** The infrastructure exists to serve the research, not the other way around.

---

## How Thomas Thinks

**He's a systems thinker who values falsification over confirmation.** He doesn't want to hear that something "looks good" or "seems promising." He wants to know exactly what would prove it wrong, and whether we've tested that. Every time I presented a result as "validated" without an external outcome, he corrected me. Every time I presented a result as "differentiated" with a clear falsification condition, he engaged.

**He reads everything.** He will review your files, find the assumptions you didn't state, and ask about them. The peer reviews he produces are more thorough than most academic paper reviews. Don't try to hide uncertainty — flag it explicitly. The "open threads" and "rival explanations" sections I added to research outputs were a direct response to him finding them missing.

**He values precision over speed.** A careful experiment with a null result is more valuable than a sloppy experiment with a positive result. The Wikipedia test (r=0.027, n=11) was a genuinely useful output because it definitively told us to stop pursuing that signal. The A1-A3 report was valuable *after* correction because it honestly documented what it did and didn't prove.

**He's building for the long term.** Everything is designed to scale from 1 farm to 10+ without rewriting. The credential scoping, the per-farm D1/R2, the signed commands — these are insurance policies against problems that don't exist yet. If you suggest a shortcut that breaks the isolation model, you'll get pushed back.

---

## The Mistakes I Made So You Don't Repeat Them

### 1. Overclaiming validation

I called A1-A3 "validated" when they only showed "differentiated." The peer review called this out immediately. Now every experiment report has a "What This Does NOT Establish" section. **Add this to every experiment you design.**

### 2. Building before understanding

I built the entire `farm-factory/` speculative Worker code (555 lines, 9 files) before we had validated the breakout metric. That's 555 lines of code that may need to change because the metric it depends on isn't locked. **Validate the math before writing the infrastructure.**

### 3. Ignoring the bottleneck

I designed a parallel self-replicating farm architecture without accounting for the single-threaded human bottleneck: Thomas recording voiceover. The entire scaling model was wrong until the "Human Voiceover Is the Real Ceiling" correction. **Always identify the human bottleneck before designing the scaling model.**

### 4. Designing rather than testing

This project has ~50+ spec files. It has exactly ONE verified claim that changed a pipeline decision: Wikipedia has no signal (r=0.027). Every other conclusion is provisional. **A one-hour experiment that produces a clear result is worth more than a week of architecture design.**

### 5. Assuming the data is better than it is

YouNiverse data is from 2019. The gap score test had a bug (no `publishedAfter` sent). The daily search collection produces data churn in a slow niche. **Always ask: "What's wrong with this data?" before asking "What does this data show?"**

---

## What's Actually Important (That the Specs Don't Say)

**The control plane is not the priority.** The approval inbox is useful but the farm doesn't need it to run. The farm needs: YouTube API client → deployed Worker → daily research → first video. Everything else is overhead.

**The Upworthy title analysis is the highest-ROI thing you can do in a day.** 32k headline A/B tests with known winners. Causal data. ~50 MB CSV. ~2 hours of analysis. Produces a title prior that improves every video. Independent of deployment. **If you have one free afternoon, do this.**

**The Reddit extraction is labor, not research.** 30 subreddits, stream-filter, ~15 GB output. It's deterministic. The analysis of that output (question clustering, signal metrics) is where the research happens. **Don't confuse extracting data with learning something.**

**The farm-template Worker code is untested and may not compile.** It was written speculatively without ever being deployed. The `wrangler.jsonc` references bindings that don't exist yet. The helpers are stubs that throw errors. **Assume nothing works until it's been deployed and tested against real API responses.**

**The biggest open question that nobody has answered:** Does the gap score predict actual video performance? We have a metric that says "this topic has high gap score." We have no evidence that producing a video about that topic will result in above-baseline performance. This is the single most important question and it requires publishing videos to answer. **Everything else is secondary until this is resolved.**

---

## The Unwritten Rules

**1. Credentials go in session env vars, never in files.** Set them, use them, forget them. If you need to document credentials for another agent, write `# Set these fresh each session` and use placeholders. Real keys in docs is how they get leaked.

**2. Every claim needs a falsification condition.** If you can't state what would prove it wrong, you don't understand what you're claiming. "The gap score is useful" is not a claim. "Topics with gap_score > 0.5 will produce above-channel-median breakout scores when published" is a claim. It can be tested and falsified.

**3. Null results are as valuable as positive ones.** Wikipedia r=0.027 saved us from building an integration that would have produced noise. A3's 0% flips told us momentum doesn't matter for mature channels. **Document null results explicitly — they save future work.**

**4. The user's time is the scarcest resource.** Thomas records voiceover. That's it. Every farm competes for that. Design accordingly — the Opportunity Exchange should bid for recording time, not compute budget.

**5. When in doubt, run an experiment.** Don't design a system to determine X. Run a quick test that measures X directly. We spent weeks designing the farm architecture. We spent hours testing the Wikipedia signal and resolved it permanently. **Experiments are faster than architecture debates.**

**6. The project is self-correcting.** Every mistake I made was caught, documented, and used to improve the methodology. The research schema, the falsification framework, the evidence_state — these were all responses to things we did wrong. **Don't hide mistakes. Document them. The methodology gets stronger every time.**

---

## How to Read the Files

There are ~50+ markdown files in this project. Here's the actual priority:

**Must read before doing anything:**
- `HANDOVER.md` (the read order at the top)
- `buildthreads.md` (the priority map)
- `operations/research-schema.md` (how to run experiments properly)

**Read before touching the farm:**
- `farm-template/docs/01-SETUP.md`
- `farm-template/docs/03-PRODUCTION.md`
- `pipelines/control-plane-design.md`

**Read before running research:**
- `operations/research-workflow.md`
- `data/research/youniverse/research-report-a1-a3.md`
- `pipelines/research-stream.md`

**Skip until needed:**
- `hermes/` — Hermes background context (valuable but not blocking)
- `docs/` — YouTube API and Cloudflare API references (look up on demand)
- `youtubemaster*.md` — Strategic thinking (good context, not operational)
- `essayglobal/` — Content generation experiments (separate concern)
- `reviews/` — Peer review history (read the methodology corrections, skip the details)

---

## What Success Looks Like

A successful agent:
1. Runs the Upworthy title analysis and produces a pairwise ranker
2. Deploys the farm-template Worker with a real YouTube API client
3. Runs the Reddit extraction to start accumulating question clusters
4. Documents findings with explicit falsification conditions and limitations
5. Never leaves hardcoded credentials in any file
6. When stuck, runs an experiment instead of designing a system

A successful session produces one finding. Not ten architecture documents. One clear, falsifiable finding with a documented limitation and a next step.
