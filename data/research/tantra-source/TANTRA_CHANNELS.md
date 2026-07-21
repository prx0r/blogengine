# Tantra Source Channels — Content Mining Dataset

**Purpose:** Download lectures, extract audio + transcripts, repackage into longform/sleepy/shorts content.
**Not for title analysis — for content inventory.**

## Tier S — Indispensable (download ALL videos)

These are the richest source archives. Full download priority.

| # | Channel | Handle | Est. Videos | Focus |
|---|---------|--------|-------------|-------|
| 1 | Vimarsha Foundation | @VimarshaFoundation | 200+ | Saiva-Sakta Tantra, Sanskrit, ritual |
| 2 | Lakshmanjoo Academy | @LakshmanjooAcademy | 200+ | Kashmir Saivism primary archive |
| 3 | Christopher Wallis | @christopherwallis751 | 300+ | Classical Tantra, Pratyabhijna |
| 4 | Tantra Illuminated | @TantraIlluminated | 100+ | Saiva Tantra courses |
| 5 | Oxford Centre for Hindu Studies | @ochsonline | 50+ | Alexis Sanderson, academic |
| 6 | Devipuram | @devipuram | 500+ | Living Srividya archive |
| 7 | INDICA | @INDICAOrg | 200+ | Scholar talks |
| 8 | Advaita Academy | — | 300+ | Kashmir Saivism, Abhinavagupta |
| 9 | The Sanskrit Channel | @TheSanskritChannel | 500+ | Sanskrit texts, deities |
| 10 | Universal Shaiva Fellowship | — | 100+ | Lakshman Joo lineage |
| 11 | Ishwar Ashram Trust | — | 100+ | Kashmir Saivism |
| 12 | Sri Vidya Temple | @srividyatemple | 100+ | Srividya ritual |
| 13 | Channels of Grace | @channelsofgrace5450 | 50+ | Early Devipuram |
| 14 | Project Shivoham | — | 100+ | Saivism visual/historical |
| 15 | SOAS Centre of Yoga Studies | — | 50+ | Academic yoga/tantra |

## Tier A+ — Exceptional scholarship

Download selectively by topic.

| # | Channel | Handle | Value |
|---|---------|--------|-------|
| 16 | Hindu University of America | @HinduUniversity | Full courses on Tantra |
| 17 | Wisdom of the Sages | @wisestudies | James Mallinson et al. |
| 18 | British Museum | @britishmuseum | Tantra art history |
| 19 | Met Museum | @metmuseum | Tantric art |
| 20 | Rubin Museum | — | Vajrayana iconography |
| 21 | Muktabodha Institute | — | Saiva manuscript preservation |
| 22 | French Institute Pondicherry | — | Saiva Agama manuscripts |
| 23 | EFEO | — | Sanskrit, Saivism scholarship |

## Tier A — Kashmir Saivism specialists

Download for specific figure/teacher content.

| # | Channel | Value |
|---|---------|-------|
| 24-29 | Nondual Shaiva Tantra, The Shiv Sutras, Kashmir Shaivism School, Anuttara Trika Kula, Swami Shankarananda, Paul Muller-Ortega | Trika explanations |
| 30-37 | Douglas Brooks, Bettina Baumer, Mark Dyczkowski, Navjivan Rastogi, Sthaneshwar Timalsina, Alexis Sanderson lectures | Scholar talks |

## Tier A — Srividya / Sakta

| # | Channel | Value |
|---|---------|-------|
| 38-50 | Sri Vidya Learning Centre, Dr Kavitha Chinnaiyan, Smita Venkatesh, various temple channels | Goddess traditions |

## Tier B+ — Public-facing

Download for performance data and format ideas, not source material.

| # | Channel | Why |
|---|---------|-----|
| 51-60 | Rajarshi Nandy, Tantra Talks, Praveen KaliPutra, Shishir Kumar, etc. | Show what topics attract broad audiences |

## Workflow

1. **Run channel analysis** on all tiers → get video inventory
2. **Filter by tier S/A+** → these are the download targets
3. **Download audio + transcripts** via yt-dlp (requires cookies)
4. **Transcribe** any videos missing captions via whisper
5. **Index transcripts** → searchable by topic, figure, text
6. **Repackage:** longform sleepy compilations, shorts from quotable moments

## Storage

```
/root/youtube-downloads/
  {channel_name}/
    {video_id}.mp3
    {video_id}.en.srt
    {video_id}.json  # metadata (title, views, etc.)
```
