# Research Progress Log

This file documents all experiments run, their results, and methodological lessons learned. The goal is to build a disciplined research practice that future agents (and future sessions of this agent) can learn from.

---

## 2026-07-21 — Session 1

### Context
Running P4 (Wikipedia Pageview Velocity) and P1 (YouNiverse Breakout v2) autonomously. Initial review found 4 design flaws in P4 and 5 in P1 — documented below.

### P4 Design Flaws Found
1. Entity name resolution — Wikipedia case sensitivity and redirects
2. Zero-division in velocity formula (year_ago = 0)
3. YouTube totalResults unreliable per arXiv:2506.11727 — use channel_count instead
4. 1.2 threshold arbitrary — use top quartile
5. US-only misses gap logic — add IN region query

### P4 Preliminary Results (50 entities, 2026-07-21)
- 49/50 entities have data, 46 with ≥10 daily views
- Rising (>1.2): 3 entities — Trika (1.82x, 79 vpd), Meditation (1.61x, 2,011 vpd), Yoga (1.36x, 3,200 vpd)
- Stable (0.8-1.2): Spanda (1.17x), Kriya_Yoga (0.97x), Western_esotericism (0.97x), etc.
- Declining (<0.8): Shiva (0.63x, 3,662 vpd), Kali (0.73x, 2,106 vpd), Buddhism (0.78x, 4,131 vpd)

**Gate: 3/50 ≥ 10 → FAIL**

**Interpretation:** Core tantra topics are stable-to-declining on Wikipedia. This is expected — established niche topics don't grow. Adjacent mass topics (Meditation, Yoga) ARE rising with substantial volume. The most narrow terms (Trika, Spanda, Vijnana Bhairava) show highest velocity, suggesting specialist curiosity is growing even if umbrella interest is flat.

**Next probe:** Phase 2 — YouTube correlation (partial). Trika (wiki 1.82x) has 14 US channels across 2 queries. Kashmir Shaivism and Meditation queries hit YouTube daily quota (90/100 already used before this session). Queue these for tomorrow when quota resets.

**Emerging finding:** Trika is the strongest correlation signal. Narrow specialist term with Wikipedia velocity AND YouTube channel activity. May be a production target even within the primary niche.

### P1 Design Flaws Found
1. OLS may not converge for low-variance channels
2. Weeks 1-4 window misses slow-burn breakouts
3. Momentum stripping may remove real content-driven signal
4. YouNiverse categories too broad for topic decomposition
5. Survivorship bias — channels that quit are excluded
