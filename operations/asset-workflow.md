# Asset Download Workflow — From Blueprint to FableCut

## The Full Pipeline

```bash
# One command builds a complete video from any blueprint:
python3 scripts/pipeline/build-from-blueprint.py TBP-NNN
```

This does:
1. Parses the blueprint for beat structure + asset URLs
2. Downloads all images from Wikimedia/Met Museum via Tor proxy (bypasses Hetzner blocks)
3. Downloads YouTube reference clips via yt-dlp (requires cookies.txt)
4. Generates voiceover via edge-tts
5. Matches art from the 904-piece library to each segment
6. Generates beat-map.md + FableCut project.json
7. Loads everything into FableCut at localhost:7777

## What Each Blueprint Needs

### Asset URLs
Blueprints list assets as AST-001 through AST-NNN. Each AST entry should include:
- A direct download URL (Wikimedia `Special:FilePath`, Met Museum `collectionapi`, etc.)
- Or a museum object ID (for IIIF/manual download)

**Current asset coverage:**
| Source | Status | How |
|--------|--------|-----|
| Wikimedia Commons | 🟡 403 via Tor | Use `Special:FilePath/FILENAME?width=1280` |
| Met Museum Open Access | ✅ Working | `collectionapi.metmuseum.org/public/collection/v1/objects/{ID}` |
| British Museum | ❌ DNS blocked | Needs proxy or local download |
| YouTube reference | ❌ Bot detected | Needs `cookies.txt` |

### Beat Narration
Each BEAT needs narration text for voiceover generation. Currently the Abhinavagupta storyboard has this; blueprints use titles as fallback. For full voiceover, add narration to the storyboard section.

## Tor Proxy (for Hetzner-blocked sources)

Tor is installed and running at `localhost:9050`. The build script auto-detects it:

```bash
# Test Tor is working:
curl -s --socks5-hostname localhost:9050 https://check.torproject.org/api/ip

# If Tor stops:
sudo systemctl start tor
```

## Manual Asset Download (for blocked sources)

When automated download fails, assets can be downloaded manually:

```bash
# On your local machine (not blocked by Hetzner):
python3 -c "
import urllib.request
urls = [
    ('wiki_image.jpg', 'https://upload.wikimedia.org/wikipedia/commons/...'),
    ('met_object.jpg', 'https://collectionapi.metmuseum.org/...'),
]
for fn, url in urls:
    urllib.request.urlretrieve(url, fn)
    print(f'Downloaded {fn}')
"

# Then copy to VPS:
scp *.jpg root@VPS:/root/projects/FableCut/media/
```

## Current Media Library

```
/root/projects/FableCut/media/ — 73+ files
├── seg-*.mp3          (voiceover from edge-tts)
├── art_*.jpg          (matched from 904-piece art library)
├── met_*.jpg          (Met Museum Open Access)
├── alchemy_*.jpg      (alchemy art library)
├── art_alchemy_*.jpg  (additional alchemy art)
├── art_angel_*.jpg    (angelic art)
└── ref_*.mp4          (YouTube reference clips, requires cookies)
```

## Blueprint Pipeline Flow

```
Blueprint (TBP-NNN)
  ├── metadata (channel, runtime, title)
  ├── beats (12 segments with timestamps + roles)
  ├── hypotheses (HYP-01–05)
  ├── claims (CLM-001+)
  ├── sources (SRC-001+)
  └── assets (AST-001+ with URLs)

build-from-blueprint.py reads this and:
  1. Downloads AST assets via Tor proxy
  2. Generates beat-map.md
  3. Generates FableCut project.json
  4. Imports media to FableCut

Result: playable video at localhost:7777
```

## Currently Hosted

| Service | Port | Access |
|---------|------|--------|
| FableCut editor | 7777 | `ssh -L 7777:localhost:7777 root@VPS` |
| Operator Dashboard | 8766 | `ssh -L 8766:localhost:8766 root@VPS` |
| Thumbnail Server | 8765 | Running |
| Hermes MCP | stdio | Running via systemd |
