# Indic Sacred Art Dataset — Build Spec

## Goal
Construct the world's largest structured dataset of Indic sacred art (Tantra, Vajrayana, Kashmir Shaivism, Shaktism, Newar Buddhism) for documentary video production, semantic search, and knowledge graph retrieval.

**Target:** 1,000,000+ processed artworks with full metadata, embeddings, and graph relationships.

---

## Source Priority

| # | Source | Type | Est. Size | Bulk Access | Priority |
|---|--------|------|-----------|-------------|----------|
| 1 | **Himalayan Art Resources** | Website scrape | ~100K artworks | Scrape required | 🔴 Highest |
| 2 | **BDRC** (Buddhist Digital Resource Center) | IIIF manifests | Millions | Bulk IIIF manifests | 🔴 Highest |
| 3 | **Smithsonian Open Access** | Bulk metadata + IIIF | ~4.9M assets | ✅ Direct download | 🟠 High |
| 4 | **Met Museum** | API + CSV | 490K objects | ✅ Working | 🟠 High |
| 5 | **Cleveland Museum** | API | ~30K | ✅ Working | 🟠 High |
| 6 | **Walters Art Museum** | API | ~100K | ✅ API available | 🟠 High |
| 7 | **Harvard Art Museums** | IIIF manifests | Millions | IIIF available | 🟡 Medium |
| 8 | **Wikimedia Commons** | Database dump | 80M+ files | Full dump available | 🟡 Medium |
| 9 | **HuggingFace Deities-25** | Dataset download | ~8.2K labelled | `hf download` | 🟡 Medium |
| 10 | **Internet Archive** | Bulk download | Massive | `archive.org/download/` | 🟡 Medium |
| 11 | **Rijksmuseum** | API | ~600K | API available | ⚪ Stretch |
| 12 | **Art Institute Chicago** | IIIF | ~300K | IIIF available | ⚪ Stretch |
| 13 | **LAION-5B** (filtered caption search) | Metadata only | 5B captions | Metadata download | ⚪ Stretch |

---

## Folder Layout

```
dataset/
├── raw/
│   ├── har/                  # Himalayan Art Resources
│   ├── bdrc/                 # Buddhist Digital Resource Center
│   ├── smithsonian/          # Smithsonian Open Access
│   ├── met/                  # Metropolitan Museum
│   ├── cleveland/            # Cleveland Museum
│   ├── walters/              # Walters Art Museum
│   ├── harvard/              # Harvard Art Museums
│   ├── wikimedia/            # Wikimedia Commons
│   ├── huggingface/          # HuggingFace datasets
│   └── internet-archive/     # Internet Archive
├── processed/
│   ├── images/               # WebP (UUID-named)
│   │   ├── 000000.webp
│   │   ├── 000001.webp
│   │   └── ...
│   ├── metadata/
│   │   └── objects.parquet   # Canonical metadata table
│   ├── embeddings/
│   │   ├── clip/             # CLIP embeddings (npy)
│   │   ├── siglip/           # SigLIP embeddings (npy)
│   │   └── colpali/          # ColPali (documents only)
│   ├── captions/             # Florence-2 / Qwen2.5-VL captions
│   ├── ocr/                  # OCR text (Sanskrit/Tibetan/Devanagari)
│   ├── tags/                 # Deity, mudra, implement, colour labels
│   └── thumbnails/           # 256px previews
├── indices/
│   ├── faiss/                # FAISS index
│   ├── qdrant/               # Qdrant collection config
│   └── neo4j/                # Neo4j graph schema + import CSVs
├── scripts/
│   ├── download/
│   │   ├── 01_har.py
│   │   ├── 02_bdrc.py
│   │   ├── 03_smithsonian.py
│   │   ├── 04_met.py
│   │   ├── 05_cleveland.py
│   │   ├── 06_walters.py
│   │   ├── 07_harvard.py
│   │   ├── 08_wikimedia.py
│   │   ├── 09_huggingface.py
│   │   └── 10_internet_archive.py
│   ├── process/
│   │   ├── convert_to_webp.py
│   │   ├── deduplicate.py       # SHA256 + perceptual hash
│   │   ├── generate_embeddings.py
│   │   ├── generate_captions.py
│   │   ├── run_ocr.py
│   │   ├── detect_iconography.py # deity, mudra, implements, arms, heads, vahana
│   │   └── build_graph.py
│   └── index/
│       ├── build_faiss.py
│       ├── build_qdrant.py
│       └── import_neo4j.py
└── pipeline.py                 # Orchestrator
```

---

## Canonical Metadata Schema (parquet)

| Field | Type | Description | Source Example |
|-------|------|-------------|----------------|
| `id` | UUID | Unique identifier | `a1b2c3d4-...` |
| `source` | str | Source code | `har`, `bdrc`, `smithsonian` |
| `source_id` | str | Original ID | `HAR-12345`, `MET-39731` |
| `title` | str | Artwork title | `Shiva Nataraja` |
| `culture` | str | Culture/tradition | `Tibetan Buddhist`, `Indian Hindu` |
| `tradition` | str | Religious tradition | `Vajrayana`, `Shaivism`, `Shaktism` |
| `school` | str | Art school/style | `Kagyu`, `Newar`, `Pala` |
| `deity` | str (json) | Primary deity | `Vajrayogini` |
| `secondary_deities` | list[str] | Other deities | `[Chakrasamvara, Vajravarahi]` |
| `lineage` | str | Teaching lineage | `Marpa Kagyu` |
| `teacher` | str | Depicted teacher | `Padmasambhava` |
| `country` | str | Country of origin | `Nepal`, `Tibet`, `India` |
| `region` | str | Region | `Kashmir`, `Mustang`, `Bengal` |
| `period` | str | Historical period | `Malla`, `Pala`, `Utpala` |
| `century` | str | Century | `12th`, `13th` |
| `date` | str | Exact date | `c. 1150` |
| `museum` | str | Current location | `Metropolitan Museum of Art` |
| `material` | str | Medium | `Stone`, `Copper alloy`, `Silk` |
| `object_type` | str | Type | `Sculpture`, `Thangka`, `Manuscript` |
| `keywords` | list[str] | Tags | `[mandala, vajra, lotus]` |
| `description` | str | Curatorial description | `...` |
| `license` | str | License | `CC0`, `Public Domain` |
| `image_url` | str | Source URL | `https://...` |
| `page_url` | str | Source page | `https://...` |
| `iiif_manifest` | str | IIIF manifest | `https://...` |
| `local_path` | str | Local file path | `images/000001.webp` |
| `width` | int | Image width | 3840 |
| `height` | int | Image height | 2160 |
| `sha256` | str | File hash | `abc123...` |
| `phash` | str | Perceptual hash | `abc123...` |
| `has_ocr` | bool | OCR completed | true |
| `has_caption` | bool | Caption generated | true |
| `has_clip` | bool | CLIP embedding | true |
| `download_date` | date | When downloaded | `2026-07-22` |

---

## Download Strategy by Source

### 1. Himalayan Art Resources (scrape)
- **URL pattern:** `https://www.himalayanart.org/search/set.cfm?setID={id}`
- **Strategy:** Crawl set listings → extract artwork metadata pages → download images
- **Metadata:** Title, deity, date, lineage, school, medium, museum, iconography
- **Rate limit:** 1 req/s, polite crawl with delays
- **Tor:** May need Tor if Hetzner blocked
- **Est. time:** ~28 hours at 1 req/s for 100K artworks

### 2. BDRC (IIIF manifests)
- **URL:** `https://library.bdrc.io`
- **Strategy:** Download bulk manifest list → iterate IIIF manifests → extract image URLs → download
- **IIIF pattern:** `https://library.bdrc.io/iiif/{id}/manifest.json`
- **Images:** IIIF Image API URLs, can request any size
- **Metadata:** Work title, author, date, language (Tibetan/Sanskrit)

### 3. Smithsonian Open Access (bulk download)
- **URL:** `https://github.com/Smithsonian/openaccess` + `https://www.si.edu/openaccess`
- **Strategy:** Download bulk metadata dump (CSV/JSON) → filter for relevant departments (Asian Art, Buddhist Sculpture, etc.) → download images via IIIF
- **Filters:** culture=India/Tibet/Nepal, department=Asian, object_type=Sculpture/Painting/Manuscript
- **Bulk metadata:** Direct download from SI GitHub
- **Images:** IIIF Image API

### 4. Met Museum (API + CSV)
- **URL:** `https://collectionapi.metmuseum.org/public/collection/v1`
- **Strategy:** Search by department=Asian Art, culture=India/Tibet/Nepal → download metadata → download images
- **MetObjects.csv** (303MB, already in R2) can be used for bulk filtering
- **Images:** `https://images.metmuseum.org/CRDImages/{dept}/original/{filename}.jpg`
- **Already have:** 93 curated + ~239 bulk downloaded (noisy, needs filtering)

### 5. Cleveland Museum (API)
- **URL:** `https://openaccess-api.clevelandart.org/api/artworks`
- **Strategy:** Query by culture/type, paginate through results
- **Images:** `https://openaccess-cdn.clevelandart.org/{id}/{id}_web.jpg`
- **Rate limit:** None detected
- **Already have:** 23 images

### 6. Walters Art Museum (API)
- **URL:** `https://api.thewalters.org/v1/objects`
- **Strategy:** Query by culture/classification, paginate
- **Images:** IIIF Image API
- **Known for:** Excellent South Asian manuscripts collection

### 7. Harvard Art Museums (IIIF)
- **URL:** `https://iiif.harvard.edu/manifests/` (or per-museum)
- **Strategy:** Crawl IIIF collections → filter by culture/period
- **Images:** IIIF Image API
- **Collections:** Sanskrit manuscripts, Nepalese art, Indian paintings

### 8. Wikimedia Commons (database dump)
- **URL:** `https://dumps.wikimedia.org/commonswiki/`
- **Strategy:** Download Commons dump → filter by categories (Hindu deities, Tibetan Buddhism, etc.) → download images via Tor
- **Alternative:** Use MediaWiki API for targeted category queries
- **Categories to target:** `Category:Hindu_deities`, `Category:Tibetan_Buddhist_paintings`, `Category:Tantric_art`, `Category:Shiva`, `Category:Mandala`

### 9. HuggingFace Deities-25
- **URL:** `https://huggingface.co/datasets/Yegiiii/deities-25`
- **Strategy:** `hf download Yegiiii/deities-25 --repo-type dataset`
- **Size:** ~8,200 labelled deity images
- **Already labelled:** Includes deity names, directly usable

### 10. Internet Archive (bulk)
- **URL:** `https://archive.org/download/`
- **Strategy:** Search by collection + subject, use `internetarchive` Python library
- **Target collections:** `artofindia`, `smithsonian`, `museumofart`

---

## Processing Pipeline

```
raw/{source}/{file}.jpg
  │
  ├── Step 1: verify (not corrupt, >5KB, valid header)
  ├── Step 2: deduplicate (SHA256 + perceptual hash via ImageHash)
  ├── Step 3: convert to WebP (lossless, preserve original)
  ├── Step 4: generate thumbnail (256px)
  ├── Step 5: generate metadata Parquet row
  │
  ├── Step 6: OCR (Tesseract + PaddleOCR for Sanskrit/Devanagari/Tibetan)
  ├── Step 7: Florence-2 caption (detailed description)
  ├── Step 8: iconography detection (deity, arms, heads, mudra, implements, vahana)
  │   → via Qwen2.5-VL or Florence-2 fine-tuned
  │
  ├── Step 9: CLIP embedding (ViT-L/14)
  ├── Step 10: SigLIP embedding (ViT-L/16)
  ├── Step 11: ColPali (documents only)
  │
  └── Step 12: index
      ├── FAISS (local similarity search)
      ├── Qdrant (vector DB for app queries)
      └── Neo4j (knowledge graph)
```

---

## AI Labeling Schema (for each artwork)

### Iconographic Detection (via VLM)

| Field | Example | Method |
|-------|---------|--------|
| `deity_primary` | `Vajrayogini` | VLM classification |
| `deity_secondary` | `[Chakrasamvara]` | VLM detection |
| `num_heads` | 1, 3, 5, 9 | VLM count |
| `num_arms` | 2, 4, 6, 8, 12 | VLM count |
| `mudras` | `[dhyana, bhumi-sparsha]` | VLM classification |
| `implements` | `[vajra, kapala, khatvanga]` | VLM detection |
| `vahana` | `[garuda, lion]` | VLM detection |
| `colours` | `[red, gold, blue]` | VLM + color analysis |
| `has_halo` | true | VLM binary |
| `has_mandorla` | true | VLM binary |
| `posture` | `dancing, seated, standing` | VLM classification |
| `expression` | `wrathful, peaceful, semi-wrathful` | VLM classification |
| `estimated_century` | `12th` | VLM estimate |
| `estimated_region` | `Tibet` | VLM estimate |
| `tradition` | `Vajrayana` | VLM classification |

### Caption Schema (Florence-2 / Qwen2.5-VL)

Description should include:
- What is depicted (deity, figure, scene)
- Composition (central figure, attendants, landscape)
- Medium and technique (stone carving, thangka, gouache on paper)
- Colour palette
- Inscriptions or text visible (and language)
- Condition notes (damaged, restored, fragmentary)
- Estimated date/region rationale

---

## Embedding + Search

| Index | Purpose | Model | Dimensions |
|-------|---------|-------|------------|
| FAISS | Local similarity search | CLIP ViT-L/14 | 768 |
| FAISS | Local similarity search | SigLIP ViT-L/16 | 768 |
| Qdrant | Multi-modal app queries | CLIP + SigLIP | 1536 (concat) |
| Neo4j | Knowledge graph | — | — |

### Neo4j Graph Schema

```
(Artwork)-[:DEPICTS]->(Deity)
(Artwork)-[:BELONGS_TO]->(Tradition)
(Artwork)-[:ASSOCIATED_WITH]->(Teacher)
(Artwork)-[:FROM]->(Lineage)
(Artwork)-[:RELATES_TO]->(Tantra)
(Artwork)-[:LOCATED_AT]->(Museum)
(Artwork)-[:CREATED_IN]->(Period)
(Artwork)-[:ORIGINATES_FROM]->(Region)

(Deity)-[:MANIFESTATION_OF]->(Deity)         # e.g. Vajrayogini → Vajravarahi
(Deity)-[:ASSOCIATED_WITH]->(Tantra)         # e.g. Chakrasamvara Tantra
(Deity)-[:HOLDS]->(Implement)
(Deity)-[:MAKES]->(Mudra)
(Deity)-[:RIDES]->(Vahana)

(Teacher)-[:TRANSMITS]->(Lineage)
(Teacher)-[:AUTHORED]->(Text)

(Manuscript)-[:CONTAINS]->(Text)
(Text)-[:BELONGS_TO]->(Tantra)
```

---

## Storage Estimate

| Item | Per Image | 100K Images | 1M Images |
|------|-----------|-------------|-----------|
| Original (JPEG) | ~2 MB | 200 GB | 2 TB |
| WebP (lossless) | ~1.5 MB | 150 GB | 1.5 TB |
| Thumbnail (256px) | ~30 KB | 3 GB | 30 GB |
| Metadata Parquet | ~2 KB | 200 MB | 2 GB |
| CLIP embedding | 3 KB | 300 MB | 3 GB |
| SigLIP embedding | 3 KB | 300 MB | 3 GB |
| Caption text | ~1 KB | 100 MB | 1 GB |
| OCR text | ~5 KB | 500 MB | 5 GB |
| FAISS index | — | ~1 GB | ~10 GB |
| **Total** | **~3.5 MB** | **~355 GB** | **~3.5 TB** |

---

## Build Order (Phase 1: Foundation)

### Week 1-2: Download

```bash
# 1. Smithsonian (bulk metadata + filter)
python scripts/download/03_smithsonian.py --culture India,Tibet,Nepal --max 50000

# 2. Met Museum (filter existing, add Asian Art department)
python scripts/download/04_met.py --department "Asian Art" --max 10000

# 3. Cleveland Museum (full catalog)
python scripts/download/05_cleveland.py --max 5000

# 4. Walters Museum (South Asian manuscripts)
python scripts/download/06_walters.py --culture "South Asian" --max 5000

# 5. HuggingFace Deities-25
python scripts/download/09_huggingface.py

# 6. Himalayan Art Resources (scrape)
python scripts/download/01_har.py --max 50000
```

### Week 3-4: Process

```bash
# 1. Convert + deduplicate
python scripts/process/convert_to_webp.py --input raw/ --output processed/images/
python scripts/process/deduplicate.py --input processed/images/

# 2. Generate captions + iconography (batch via GPU)
python scripts/process/generate_captions.py --model florence-2
python scripts/process/detect_iconography.py --model qwen2.5-vl

# 3. Generate embeddings
python scripts/process/generate_embeddings.py --model clip
python scripts/process/generate_embeddings.py --model siglip

# 4. Build indices
python scripts/index/build_faiss.py
python scripts/index/import_neo4j.py
```

---

## Resource Requirements

| Resource | Minimal | Recommended |
|----------|---------|-------------|
| RAM | 16 GB | 64 GB |
| CPU | 4 cores | 16 cores |
| Disk | 500 GB | 4 TB |
| GPU | None (VLM on API) | 1x RTX 3090/4090 |
| Internet | 100 Mbps | 1 Gbps |

The Hetzner VPS (4 cores, 8 GB RAM, 75 GB disk) can handle **downloading only**. Processing (embeddings, VLM captions) needs a GPU instance.

---

## Integration with Existing Project

```
Existing art library:  /root/projects/blog/public/art/          ~378 images
Existing metadata:     /root/projects/blog/content/glossary/art/ ~1146 JSON files
FableCut media:        /root/projects/FableCut/media/           ~25 files

New dataset:           /root/projects/blog/dataset/               → 1M+ images

Integration:
  match-images-to-storyboard.py  → searches dataset/processed/images/
  validate-video.mjs             → check image matches storyboard narration
  vision-label-art.py            → labels new images with Google Vision
  batch-fetch-tantra-art.py      → downloads from APIs (update to use dataset)
```

The dataset is consumed by `match-images-to-storyboard.py` which scores each image against storyboard narration concepts, picks the best match per segment, and copies it to FableCut.
