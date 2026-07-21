# Vision Flaws — Where the Pipeline Breaks

> Every architecture has failure modes. This document enumerates them honestly,
> with concrete examples, before we build. Knowing where it breaks is how we
> design it not to.

---

## Stage 1: Acquisition

### Flaw 1.1: The VPS IP Gets Blocked By Everything

MDPI returned 403. Iris returned 403. Kingston returned 403. SciSpace returned 403. Harvard DASH returned a Cloudflare challenge. The VPS IP is apparently on several blocklists.

**What happens:** Acquisition silently fails for any publisher that blocks the IP. The user thinks "I sent a paper, why isn't it being acquired?" No feedback loop.

**Example:** User sends the Kiosoglou MDPI paper. Acquisition tries the OA URL from OpenAlex. Gets 403. Tries alternative URLs from OpenAlex locations[]. All 403. Creates a stub record with `access_status: paywalled_or_request_only`. User has no idea it failed until they check the record.

**Worse:** If the acquisition script doesn't log the failure properly, the user thinks the paper is being processed when it isn't.

**Mitigation:** User-assisted download prompt on Telegram. "MDPI blocks my VPS. Can you download this PDF and send it to me?" But this breaks autonomy — now the user is part of the pipeline.

**If not mitigated:** Every acquisition from a blocked publisher requires manual user intervention. The pipeline is never truly autonomous for publisher PDFs. Only works for arXiv, HAL, Zenodo, and institutional repositories that don't block the VPS.

### Flaw 1.2: The PDF Is a Scan With No Text Layer

Nanananda's Concept and Reality (36MB PDF) is a scanned image PDF. pdftotext returns 165 bytes of form-feed characters. The acquisition script saved it as `access_status: open` but it's unusable.

**What happens:** The pipeline creates a beautiful RO with zero actual content. Every paragraph is empty. The essay deploys with blank pages.

**Example:** User requests an RO on Nanananda's concept of papañca. Hermes has the PDF, creates the RO, deploys the essay. The essay has a title, metadata, and zero body text. Audio generates silence.

**Detection:** The acquisition script needs a "text layer present" check. If pdftotext returns less than N characters, flag the record and don't build ROs from it.

**Partial mitigation:** Search for an alternative text-based copy. But if none exists (as with Nanananda), the pipeline is stuck.

### Flaw 1.3: The DOI Resolves to the Wrong Paper

Crossref and OpenAlex both make mistakes. A title search might return the wrong paper if the title is generic or the query is ambiguous.

**What happens:** The wrong paper gets acquired, cataloged, and possibly compiled into an RO. Bad data propagates.

**Example:** User sends "Ficino on the Daimon." OpenAlex returns a paper by a different author with "Ficino" and "Daimon" in the abstract but no actual relevance. The acquisition script doesn't validate relevance — it just takes the top result.

**Detection:** The user sees the acquired paper's metadata in Telegram. If wrong, they can reject it. But this only works if the notification is clear enough.

## Stage 2: Impact Analysis

### Flaw 2.1: Materiality Scoring Is Too Simple

The deterministic first version of materiality scoring is: `shared_concept_count × source_quality × gap_coverage`. This is naive.

**What happens:** A paper that tangentially mentions "daimon" gets high materiality because it shares a concept, even though its actual contribution is zero. Every vaguely related paper triggers an impact notification. The user gets flooded.

**Example:** A biology paper that uses "daimon" as a metaphor in its introduction gets scored as affecting `ro:ficino-daimon`. The user receives a notification: "New paper affects ro:ficino-daimon (+5% coverage)." They check it and it's completely irrelevant.

**Community term for this:** False-positive spam. The LLM Wiki literature (particularly the materiality paper, 2606.09877) explicitly warns about this — their materiality signal `ϕt(k,n)` requires domain-specific calibration. Our generic version will be noisy.

**Mitigation:** Start with very high thresholds. Only flag papers that share 3+ concepts or that directly match an open research_todo. Accept that we'll miss some relevant papers (false negatives) to avoid overwhelming the user (false positives).

### Flaw 2.2: The Pipeline Can't Detect Cross-Tradition Connections

Two ROs from different traditions (Ficino on the daimon, Nanananda on papañca) might actually discuss the same structural insight (cognitive intermediaries). But the impact analysis only checks shared concept tags, not semantic similarity.

**What happens:** The dreaming cycle (Vision 3) is supposed to catch these, but it runs weekly. Impact detection runs daily and operates on exact concept matches. Cross-tradition connections are missed for up to a week.

## Stage 3: Proposal

### Flaw 3.1: The LLM Proposes Nonsensical Changes

When generating a knowledge PR (proposed changes to an RO), the LLM might suggest adding passages that don't actually belong, removing passages that are critical, or reorganizing in a way that destroys the structure.

**Example:** A new paper discusses Ficino's astrology. The LLM proposes adding its passages to the "prayer" section because both share the keyword "invocation." The proposed addition is structurally wrong.

**Detection:** The user reviews the PR on Telegram. They see the diff and can reject. But if the user is not deeply familiar with the material, they might approve a bad change.

**Mitigation:** Diagnostic tests after every merge (WiCER-style). If a test fails post-merge — "can the RO still distinguish daimon from spiritus?" — the change is automatically reverted. But this only catches semantic errors, not structural ones.

### Flaw 3.2: Merge Conflicts on Concurrent PRs

If the user approves two PRs for the same RO at the same time (one from a new source, one from the dreaming cycle), the second merge will conflict.

**Example:** A new Kiosoglou paper triggers a PR for `ro:ficino-daimon`. Simultaneously, the dreaming cycle proposes reorganizing the same RO. The first PR merges cleanly at `v1.1.0`. The second PR is based on `v1.0.0` and tries to merge against `v1.1.0`. Git merge fails.

**Mitigation:** The pipeline should queue PRs per RO. Only one open PR per RO at a time. The second one waits. But this slows down the pipeline.

## Stage 4: Merge

### Flaw 4.1: The User Never Approves PRs

The pipeline is designed for user review. But what if the user is busy, on holiday, or loses interest?

**What happens:** PRs pile up. ROs go stale. New sources are acquired but never integrated. The impact detection keeps sending notifications. The user feels overwhelmed and ignores them. The pipeline degrades into noise.

**Example:** The user reads one notification, doesn't have time to review it, intends to come back later, never does. Seven days later there are 12 pending PRs. The user doesn't know where to start.

**Mitigation:** Auto-expire PRs after N days. Auto-merge PRs with materiality below threshold. Only require review for high-impact changes. But this risks bad changes being auto-merged.

### Flaw 4.2: Version Numbering Drifts

If two ROs depend on each other (a higher-order RO composed from lower ones), and the lower RO gets a version bump, the higher RO is now stale — but has no way of knowing.

**Example:** `ro:daimon-across-platonists` is composed from `ro:ficino-daimon v1.0.0` and `ro:plotinus-daimon v0.8.0`. Six months later, both source ROs are at v2.0.0. The composed RO is still pinned to the old versions. It silently contains outdated information.

**Detection:** Weekly dependency drift check. But this only works if we track dependencies explicitly (which we haven't built yet).

## Stage 5: Lint + Test

### Flaw 5.1: Tests Are Too Weak to Catch Bad Compilations

WiCER's finding (53-60% catastrophic failure rate for blind compilation) is terrifying. But writing good diagnostic probes requires knowing what facts are critical — which is domain-specific and hard to automate.

**What happens:** The diagnostic tests check for surface-level correctness ("does the RO mention daimon?") but miss deep failures ("the RO conflates daimon and genius"). The tests pass. The bad RO gets published.

**Example:** `ro:ficino-daimon v1.0.0` passes all 5 diagnostic tests. But a scholar reading it notices that three paragraphs silently conflate the Socratic daimon with the Christian guardian angel — a distinction Ficino himself was careful to maintain. The tests didn't check for this because nobody wrote that test.

**Mitigation:** The Error Book. When the conflation is eventually discovered, an error entry is created: "NEVER conflate daimon and angel without explicit source evidence." Future compilations get this constraint. But the first bad version is already published.

### Flaw 5.2: The Error Book Grows Without Bound

Every compilation error adds a constraint to the Error Book. After 100 errors, the compilation prompt contains 100 rules. LLMs struggle with long, contradictory instruction lists.

**What happens:** The compilation prompt becomes so constrained that the LLM can't produce useful output. It spends more tokens satisfying constraints than compiling content.

**Example:** After 50 Error Book entries, the compilation prompt for any Ficino-related RO contains 50 "NEVER" rules. The LLM starts refusing to compile because it can't satisfy all constraints simultaneously.

**Mitigation:** Prune the Error Book. Close resolved errors. Only inject active, open constraints. Archive old ones. But determining which errors are truly resolved requires verification — another cron job.

## Stage 6: Publish

### Flaw 6.1: Deploy Breaks Something Else

The deploy step (`npm run cf:build && npm run cf:deploy`) rebuilds the entire site. A new essay could break an existing page — maybe a TypeScript error in a shared component, maybe a missing concept reference that causes the build to fail.

**What happens:** The deploy fails. The previous version of the site is still live. The user's new essay is not published. No error notification is sent (unless we build one).

**Example:** A new RO references concept `daimon_angelicus` which doesn't exist in `content/glossary/concepts/`. The build script fails because it can't resolve the concept reference. The deploy doesn't happen. The user wonders why their essay isn't live.

**Mitigation:** Pre-deploy validation — check all concept references, all source IDs, all audio files. But this is another script that can itself break.

### Flaw 6.2: Audio Generation Fails Silently

`edge-tts` might fail for some essays — unusual characters, extremely long blocks, network timeout.

**What happens:** The essay deploys without audio. The page shows a "Listen" button that doesn't work. The user doesn't know why.

### Flaw 6.3: Published Essay Contains Errors Because Lint Passed but Content Is Wrong

The most dangerous flaw. The pipeline successfully: acquired → impacted → proposed → merged → linted → tested → published. Everything looks green. But the content is subtly wrong — a mistranslation, a misattribution, a conflation that the tests didn't catch.

**What happens:** An essay with incorrect content is live on the site. A reader unfamiliar with the material takes it as authoritative. The error propagates.

**Example:** The RO compiles passages from Voss and Kiosoglou, but a transition sentence between two paragraphs accidentally attributes a Kiosoglou passage to Voss. The source citation is wrong. A reader cites this as "Voss claims X" when Voss never claimed it.

**The hard truth:** No automated pipeline can prevent this. The only mitigation is: version pins so the exact source of each passage is traceable, and an easy way for readers to report errors (which become Error Book entries).

---

## Systemic Flaws

### Flaw S.1: The Pipeline Makes Scholarship Look Easy

The danger of a system that produces beautiful, source-backed, audio-enabled scholarly compilations at the push of a button is that it conceals the difficulty of actual scholarship. The user might mistake "compiled from sources" for "discovered truth." The system is a tool for organizing existing scholarship, not a replacement for thinking.

**Mitigation:** The SOUL.md character is honest about gaps. Every RO shows its coverage score — what's covered AND what's missing. The Error Book is public. The system should be transparent about its limitations.

### Flaw S.2: The Pipeline Is Designed for One User

Everything is built for a single user (Thomas) with specific interests (Ficino, Corbin, Nanananda, Neoplatonism). The 15 RO families are designed around his library. The impact detection thresholds are calibrated for his pace of acquisition.

**What happens if a second user joins:** The concept tags are personal. The materiality thresholds are calibrated for one person's interests. The cron schedules assume one user's daily rhythm. Multi-user support would require rethinking the architecture.

### Flaw S.3: The Error Book Requires Human Verification

The Error Book accumulates constraints, but who verifies that a constraint is correctly applied? If the LLM adds a rule "NEVER cite Voss in the astrology section" because one Voss passage was incorrectly attributed, that rule might prevent legitimate Voss citations in the future.

**Example:** A single Voss passage was incorrectly tagged as "astrology" when it was actually about "vocation." The Error Book rule says "NEVER cite Voss in the astrology section." Now the astrology section is missing three legitimate Voss passages that should be there.

**Mitigation:** Every Error Book rule needs a human to verify it. But if the user isn't a domain expert, they can't reliably verify. The pipeline assumes domain expertise that may not exist.

---

## Failure Mode Summary

| # | Flaw | Stage | Severity | Mitigation Exists? |
|---|---|---|---|---|
| 1.1 | VPS IP blocked | 1 | High | Partial (user-assisted download) |
| 1.2 | Scanned PDF, no text | 1 | High | Text-layer check (not built) |
| 1.3 | Wrong DOI resolution | 1 | Medium | User notification + reject |
| 2.1 | Materiality false positives | 2 | Medium | High thresholds, accept false negatives |
| 2.2 | Cross-tradition misses | 2 | Low | Dreaming cycle (weekly) |
| 3.1 | LLM proposes bad changes | 3 | High | User review + post-merge tests |
| 3.2 | Concurrent PR conflicts | 3 | Medium | PR queue per RO |
| 4.1 | User never approves | 4 | High | Auto-expire, low-materiality auto-merge |
| 4.2 | Version drift across ROs | 4 | Medium | Dependency tracking (not built) |
| 5.1 | Tests too weak | 5 | **Critical** | Error Book (reactive, not preventive) |
| 5.2 | Error Book grows too large | 5 | Medium | Pruning + archiving (not built) |
| 6.1 | Deploy breaks site | 6 | High | Pre-deploy validation (not built) |
| 6.2 | Audio fails silently | 6 | Low | Check audio file after generation |
| 6.3 | Wrong content passes all checks | 6 | **Critical** | Version traceability + reader reports |
| S.1 | Makes scholarship look easy | Systemic | Medium | Transparent coverage scores |
| S.2 | Single-user design | Systemic | Low | Accept for now |
| S.3 | Error Book needs human verification | Systemic | High | Domain expertise required |

---

## The Hardest Truth

The most dangerous failure mode is not any single flaw. It's that the system produces **beautiful, plausible, subtly wrong output** — and nobody catches it because the process looks reliable.

A single misattributed passage in a 50-paragraph RO is invisible to automated tests. It's invisible to a casual reader. It might be invisible to the user if they're not a domain expert. But a scholar who reads it will spot it immediately — and lose trust in the entire system.

The only defense is: **never pretend to be authoritative.** Every RO is a living document, versioned, source-tracked, with explicit coverage scores. Errors will be found and corrected. The Error Book ensures they aren't repeated. The pipeline is honest about being a tool, not a scholar.

> The system is not an oracle. It is a meticulously organized library. The difference matters.
