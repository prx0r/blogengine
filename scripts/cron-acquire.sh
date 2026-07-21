#!/bin/bash
# Direct-source Tier 2 acquisition — HAL → Zenodo → Internet Archive
# Runs every 2 minutes via crontab. No OpenAlex. No API keys needed.
cd /root/projects/blog

AUTHORS=("Henry Corbin" "Marsilio Ficino" "Ibn Arabi" "Suhrawardi" "Iamblichus" "Proclus" "C.G. Jung" "James Hillman" "Plotinus" "Plato" "Angela Voss" "Gregory Shaw" "Rudolf Steiner" "Plotinus")
TOPICS=("imaginal" "mundus imaginalis" "daimon" "theurgy" "angelology" "barzakh" "ishraq" "active imagination" "soul making" "ritual" "divine symbols" "participation" "eros" "illumination" "spiritus" "neoplatonism" "henosis" "emanation")

author=${AUTHORS[$RANDOM % ${#AUTHORS[@]}]}
topic=${TOPICS[$RANDOM % ${#TOPICS[@]}]}
query="$author $topic"
ts=$(date +%s)
logf="/root/.hermes/cron/cron-acquire.log"
echo "[$(date)] === $query ===" >> $logf

# ─── 1. HAL — direct PDF URLs, no auth ─────────────────────────
hal_query=$(echo "$query" | sed 's/ /+/g')
hal_url="https://api.archives-ouvertes.fr/search/?q=${hal_query}&fq=submitType_s:file&wt=json&fl=title_s,fileMain_s,uri_s&rows=3"
result=$(curl -sL "$hal_url" 2>/dev/null)

python3 -c "
import json, os, urllib.request, sys
try:
    d = json.loads('''$(echo "$result" | sed "s/'/'"'"'/g")''')
except:
    sys.exit(0)
for r in d.get('response',{}).get('docs',[]):
    title = (r.get('title_s') or [''])[0][:60]
    pdf = r.get('fileMain_s') or ''
    if not pdf:
        continue
    slug = title.lower().replace(' ', '-').replace('/', '-').replace('\'', '')[:40]
    dest = f'library/corbin/hal-{slug}-$ts.pdf'
    try:
        urllib.request.urlretrieve(pdf, dest)
        if os.path.getsize(dest) > 1000 and open(dest,'rb').read(4) == b'%PDF':
            work = {
                'work_id': f'work:hal-{slug}',
                'title': title,
                'authors': [{'name': '$author'}],
                'publication': {'type': 'article'},
                'tier': 2,
                'topics': ['$topic', '${author%% *}'],
                'assets': {'pdf_path': dest},
                'provenance': {'access_status': 'open', 'oa_status': 'green', 'source': 'hal'},
                'analysis': {'tier': 2, 'tier_label': 'scholarly commentary'}
            }
            wp = f'content/works/work_hal-{slug}.json'
            if not os.path.exists(wp):
                json.dump(work, open(wp, 'w'), indent=2)
                print(f'  HAL OK: {title[:40]} → {wp}')
    except:
        pass
" 2>/dev/null >> $logf

# ─── 2. Zenodo — direct file downloads, no auth ─────────────────
zn_url="https://zenodo.org/api/records?q=${hal_query}&size=5&sort=mostrecent"
zn_result=$(curl -sL "$zn_url" 2>/dev/null)
python3 -c "
import json, os, urllib.request, sys
try:
    d = json.loads('''$(echo "$zn_result" | sed "s/'/'"'"'/g")''')
except:
    sys.exit(0)
for r in d.get('hits',{}).get('hits',[]):
    title = r.get('metadata',{}).get('title','')[:60]
    files = r.get('files',[])
    for f in files:
        url = f.get('links',{}).get('self','')
        if not url or not url.endswith('.pdf'):
            continue
        slug = title.lower().replace(' ', '-').replace('/','-')[:40]
        dest = f'library/corbin/zenodo-{slug}-$ts.pdf'
        try:
            urllib.request.urlretrieve(url, dest)
            if os.path.getsize(dest) > 1000 and open(dest,'rb').read(4) == b'%PDF':
                work = {
                    'work_id': f'work:zenodo-{slug}',
                    'title': title,
                    'authors': [{'name': '$author'}],
                    'publication': {'type': 'article'},
                    'tier': 2,
                    'topics': ['$topic', '${author%% *}'],
                    'assets': {'pdf_path': dest, 'source_url': r.get('doi','')},
                    'provenance': {'access_status': 'open', 'oa_status': 'open', 'source': 'zenodo'},
                    'analysis': {'tier': 2, 'tier_label': 'scholarly commentary'}
                }
                wp = f'content/works/work_zenodo-{slug}.json'
                if not os.path.exists(wp):
                    json.dump(work, open(wp, 'w'), indent=2)
                    print(f'  ZENODO OK: {title[:40]} → {wp}')
        except:
            pass
" 2>/dev/null >> $logf

echo "[$(date)] Done" >> $logf
