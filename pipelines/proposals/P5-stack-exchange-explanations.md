# P5: Stack Exchange Explanation Mining

**Layer:** Knowledge — Script research and audience language
**Engine:** Source Engine (E9)
**Dataset:** Stack Exchange — 337 MB across 5 sites
**R2 path:** `s3://research-datasets/blueprint/stackexchange/`
**Status:** Not started

## Research Question

Do Stack Exchange Q&A pairs (Hinduism, Buddhism, Philosophy, History, Mythology) provide high-quality community-validated explanations that can serve as script research material?

## Hypothesis

Stack Exchange questions contain the exact language that curious non-specialists use when encountering tantra-related concepts. The accepted answers represent community-validated explanations. A corpus of Q&A pairs on our target topics provides free script research: "what do people ask, and what does the community agree is the best answer?"

**Falsification:** Fewer than 50 Q&A pairs across all 5 sites match our target topic list. The Stack Exchange corpus is too thin for our niche.

## Methodology

1. Extract 7z archives to XML/JSON
2. Filter questions by tags/concepts matching target topics: tantra, kashmir-shaivism, abhinavagupta, kundalini, nonduality, advaita, yoga, meditation, theurgy, neoplatonism, etc.
3. For each matching question:
   - Extract title, body, tags, score, answer_count
   - Extract accepted answer (if exists): body, score, comments
4. Classify question type: definitional, practical, comparative, critical
5. For each topic, build a Q&A knowledge base:
   - What questions recur most?
   - What answers get most upvotes?
   - Which questions have no accepted answer? (content gap)
6. Compare accepted answers against RO passages — do they agree or contradict?

## Output Schema

```json
{
  "experiment": "P5-stack-exchange-explanations",
  "timestamp": "YYYYMMDD_HHMMSS",
  "total_questions_scanned": 500000,
  "matching_questions": 200,
  "topics_covered": ["nonduality", "kundalini", "tantra", "advaita", "meditation"],
  "by_site": {
    "hinduism": { "matching_questions": 80, "topics": ["tantra", "advaita", "kundalini"] },
    "buddhism": { "matching_questions": 45, "topics": ["meditation", "nonduality"] },
    "philosophy": { "matching_questions": 50, "topics": ["nonduality", "consciousness"] },
    "history": { "matching_questions": 15, "topics": ["tantra", "theurgy"] },
    "mythology": { "matching_questions": 10, "topics": ["kali", "shiva"] }
  },
  "unanswered_questions": [
    {"question": "What is the difference between pratibimba and svatantrya?", "site": "hinduism", "score": 5}
  ],
  "gates": {
    "sufficient_matching_questions": true,
    "qa_pairs_retrievable": true
  },
  "next_step": "Integrate accepted answers into Source Engine for script research",
  "limitations": ["SE answers are community-validated, not scholar-validated. Cross-reference with RO library"]
}
```

## Engine Integration

```
source_engine.stack_exchange(topic) → {
    questions: [{ title, score, answer_count }],
    accepted_answers: [{ text, score, comment_count }],
    unanswered: [{ question, score, tags }]
}
```

Fed into the **Conjunction** stage: SE explanations become the "mass audience understanding" against which the specialist RO answer is compared. The gap between them IS the script's value proposition.

## Gotcha

7z archives need `p7zip` to extract. Each is 50-120 MB compressed, 200-500 MB uncompressed. Extract to `/tmp/` (not the volume — it's nearly full).
