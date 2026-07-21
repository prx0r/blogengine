---
name: yogi-spotlight
description: Research and write philosopher/yogi spotlight profiles. Each PO (Philosopher Object) captures their life story, metaphysics, lineage, and video treatment.
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [yogi, philosopher, spotlight, research, biography]

---

# Yogi Spotlight — Philosopher Object (PO) System

A repeatable format for spotlighting obscure yogis, siddhas, and philosophers. Each one is a self-contained research object + video treatment.

## The PO Template

Every Philosopher Object follows this structure:

```
po-{name}/
├── po.json          # Structured data (template below)
├── sources.md       # All source links, citations, references
├── quotes.md        # Notable quotes organized by theme
└── treatment.md     # Video treatment options
```

### po.json format

```json
{
  "po_id": "po:khaptad-baba",
  "name": "Paramahaṃsa Svāmī Saccidānanda Sarasvatī (Khapaḍa Bābā)",
  "aliases": ["Khaptad Swami", "Śivanātha Dogra"],
  "tradition": ["Advaita Vedānta", "Haṭha Yoga", "Tantra"],
  "era": {"born": 1880, "died": 1996},
  "region": "Kashmir → Calcutta → UK → Kashi → Khapaḍa Valley, Nepal",
  "guru": "Self-realized; Dashanāmī order",
  "known_for": "50-year solitary hermitage; Khapaḍa National Park; guru to Sthaneshwar Timalsina",
  "hook": "a western-trained surgeon from kashmir who walked into the himalayas and was never seen again — until he founded a national park",
  "biography": {
    "early_life": "",
    "renunciation": "",
    "practice": "",
    "legacy": ""
  },
  "teachings": {
    "core_doctrine": "",
    "emphasized_practices": [],
    "key_quotes": []
  },
  "lineage": {
    "param_guru": "",
    "guru": "",
    "disciples": ["Ācārya Sthaneshwar Timalsina"]
  },
  "why_now": "Tantra audience needs living exemplars, not just philosophy",
  "video_treatment": {
    "hook": "",
    "arc": "life → practice → teaching → why it matters now",
    "target_minutes": 12,
    "visuals": ["hermitage photos", "Khapaḍa valley", "manuscript images"]
  },
  "sources": [
    "https://www.khaptadswami.com.np/",
    "interviews with Sthaneshwar Timalsina"
  ],
  "research_gaps": [
    "exact birth date uncertain",
    "few recorded teachings in English"
  ]
}
```

## Research Method

For each yogi, research in this order:

1. **Wikipedia / standard sources** — establish basic timeline, tradition, region
2. **Academic papers** — search Google Scholar for the yogi's name + tradition
3. **Primary disciple interviews** — YouTube interviews with their students
4. **Original texts** — if they wrote anything, find translations
5. **Visual assets** — photos, locations, manuscript images

## The Secret Sauce: Why This Works

The hook is the *insane claim* about the yogi. The decode is Tantraloka theory explaining *what is actually happening*. These are not biographies — they are **living demonstrations of Tantraloka principles**.

The format:
```
hook: [the insane claim — "the yogi who stopped his heart"]
→ the story: [their life, what they did, the evidence]
→ the decode: [Tantraloka explains what's happening — prana, spanda, samadhi]
→ why it matters now: [what this means for you]
```

## Candidate List

### Tier 1: Mind-Blowing (immediate)

| Yogi | The Insane Claim | Tantraloka Decode | Why Now |
|------|-----------------|-------------------|---------|
| **Swami Rama** | Stopped his heart for 17 seconds at the Menninger Foundation — proved the subtle body is real to Western science | Prana controls the involuntary nervous system; the yogi redirects apana to suspend cardiac function | 1970s science proved what Tantra always knew |
| **Prahlad Jani ("Breatharian")** | Allegedly lived 70+ years without food or water; hospitalized twice for observation — doctors couldn't explain it | Pranic sustenance (the yogi absorbs prana directly, bypassing the need for gross food); kevala-kumbhaka state reduces metabolic needs to near zero | The breatharian phenomenon is real — just not understood |
| **Tibetan Tummo Yogis** | Dry wet sheets on naked bodies in -20°C Himalayan winters using only inner heat | Tejas tattva + kundalini-agni; the yogi redirects the fire element from manipura to heat the entire body; pranayama generates inner fire | Neuroscience has studied this; no one has explained the mechanism |
| **The Hanging Yogi of Nepal (Bhole Baba?)** | Hung upside down from a tree for weeks or months; claimed it purified the pranic flow | Viparita karani (inverted posture) redirects apana to the crown; the droplet on the head = amrita dripping from sahasrara, sustained by udana vayu | The droplet is the key — it's the external sign of internal nectar |
| **Neem Karoli Baba (Maharaj-ji)** | Died and was revived three times; could read minds; appeared in two places at once; inspired Steve Jobs and Ram Dass | Siddhis (vibhuti) from kundalini awakening; trikalajnatva (knowledge of past, present, future) from pratyabhijna; the ecstatic's body is a portal | The most documented modern siddha; his miracles prove the tradition |
| **Ramana Maharshi** | Died at 16 — walked to a temple, laid down, and "played dead." Spent 54 more years in the body, teaching from a state beyond it | Mahābhāva (supreme non-dual absorption); the body continues in jīvanmukti sustained solely by prārabdha karma; the witness state made permanent | The simplest teaching matches the deepest Tantra |

### Tier 2: Deep Cuts (great for series expansion)

| Yogi | Tradition | Hook |
|------|-----------|------|
| Khapaḍa Bābā | Advaita + Tantra | Surgeon who walked into Himalayas, founded a national park |
| Matsyendranāth | Nātha | Who really founded Haṭha Yoga? A fisherman who met Śiva underwater |
| Vidyāraṇya Svāmī | Advaita | The minister who became a monk, wrote the *Sarvadarśana-saṃgraha*, and revived the Śaṅkara order |
| Lakṣmaṇa Jū (Lakshmanjoo) | Kashmir Śaivism | The last living master of the oral tradition — he carried 1000 years of unbroken teaching |
| Lallā Dēd (Lalleshwarī) | Kashmir Śaivism | A 14th-century woman who walked naked through Kashmir singing poems of radical non-duality |
| Saraha | Buddhist Tantra | A brahmin who left the temple for the beer hall — and wrote the most profound Tantric poetry |
| Gorakṣanāth | Nātha | The siddha who controls the serpent — Haṭha Yoga's most mysterious figure |
| Jñāneśvar | Bhakti + Vedānta | Wrote an immortal commentary on the Gita at 16, died at 21 |
| Paramahaṃsa Yogananda | Kriyā Yoga | Brought kriyā to the West; his body didn't decay after 20 days |
| Trailanga Svāmī | Advaita | Reputed to have lived 300 years; ate only poison; sat in samadhi under water for months |
| Rāmakṛṣṇa Paramahaṃsa | Bhakti + Tantra | The ecstatic who lived in sahaja — Divine intoxication as a permanent state |
| Patañjali | Yoga | Not just the Yoga Sūtras — he was a siddha who codified the entire system from direct experience |

### Tier 3: Bizarre Research Candidates (verify first)

| Figure | Claim | What Needs Checking |
|--------|-------|-------------------|
| Prahlad Jani | 70 years without food | Medical studies exist (2010, 2012); results inconclusive |
| The droplet yogi | Sustained by water drops at crown | Many traditions reference this; need a specific named figure |
| Bole Baba | Hanging upside down for months | Reports from Nepal; need verification |
| Tibetan tummo | Wet sheets dry on body | Well-documented; Benson et al. studied it |
| Swami Rama | Stopped heart at Menninger | Documented; multiple witnesses; video exists |
| Sri Aurobindo | Physical transformation ("supramental body") | Aurobindo Ashram records; his body was said to be radiant at death |

## Prompt Templates

### Create a new yogi spotlight
```
Research [yogi name]. Fill out the PO template. 
Focus on: why they matter now, what the hook is, 
and what video treatment would work. Include source links.
```

### Compare two yogis
```
Compare [yogi A] and [yogi B]. 
What do they share? Where do they diverge? 
Would a comparative video work better than separate spotlights?
```

### Find the next yogi
```
We need the next yogi spotlight subject. 
Find an obscure but impactful figure from [tradition]. 
The criteria: incredible life story, clear teaching, 
underserved on YouTube, visual research material available.
```

## Source Notes

### Kṣemarāja
- **Pratyabhijñāhṛdayam** (Heart of Recognition) — 20 sutras, ~20 pages. Jaideva Singh translation on Archive.org. The clearest entry point into Recognition philosophy.
- **Śiva Sūtra Vimarśinī** — commentary on Śiva Sūtras. Jaideva Singh translation.
- **Spanda Saṃdoha** — summary of Spanda teachings. Dyczkowski translation.

### Utpaladeva
- **Īśvara Pratyabhijñā Kārikā** (Verses on Recognition) — ~190 verses in 4 books. R. Torella translation (2002, Motilal Banarsidass) is the standard.
- **Stotrāvalī** — devotional hymns. Partial translations online.
- Core insight: Utpaladeva = philosophical foundation. Kṣemarāja = the summarizer who made it accessible.

### Where to Find
- Archive.org: Jaideva Singh translations
- Motilal Banarsidass: Torella's Īśvara Pratyabhijñā
- Muktabodha Indological Library: Sanskrit texts
- Lakshmanjoo Academy: recorded teachings

### Research Gaps
- Kṣemarāja's Svacchanda Tantra commentaries largely untranslated
- Utpaladeva's Stotrāvalī lacks complete English translation
- No single-volume edition of Kṣemarāja's major works

## Priority PO Candidates (Underserved + High Impact)
1. **Kṣemarāja** — Pratyabhijñāhṛdayam: 20 sutras, almost no YouTube content
2. **Utpaladeva** — Īśvara Pratyabhijñā: 190 verses, almost no YouTube content
3. **Khaptad Baba** — Most underserved in direct lineage (170k best views)
4. **Naropa** — Six Yogas, wildly underserved for importance (78k best views)
5. **Saraha** — The poet who drank beer and enlightened faster (336k best, no quality)
