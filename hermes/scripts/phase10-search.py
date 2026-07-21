#!/usr/bin/env python3
"""Phase 10: Search iScience + PLoS + R Soc Open Sci + eNeuro for imaginal bridge papers"""
import json, os, time, re, urllib.request, urllib.parse

UA = "Mozilla/5.0"
BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def fetch(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
    with open(dest, 'wb') as f:
        f.write(data)
    return data

# Search across OA journals
journals = [
    ("iScience", "iScience"),
    ("PLoS ONE", '"PLoS ONE"'),
    ("R Soc Open Sci", '"R Soc Open Sci"'),
    ("eNeuro", "eNeuro"),
    ("Network Neurosci", '"Netw Neurosci"'),
    ("Cereb Cortex", '"Cereb Cortex"'),
    ("Front Neurosci", '"Front Neurosci"'),
    ("Front Psychol", '"Front Psychol"'),
]

topics = [
    "mental+imagery+OR+imagination+OR+aphantasia+OR+visual+imagery",
    "consciousness+OR+subjective+experience+OR+phenomenal",
    "hallucination+OR+inner+speech+OR+voice+hearing",
    "meditation+OR+mindfulness+OR+nondual",
    "ritual+OR+chanting+OR+music+OR+entrainment",
    "interoception+OR+cardiac+OR+heartbeat+OR+body+awareness",
    "predictive+processing+OR+predictive+coding+OR+bayesian+brain",
    "default+mode+OR+mind+wandering+OR+daydreaming",
    "agency+OR+sense+of+agency+OR+embodied+cognition",
    "creativity+OR+mental+simulation+OR+counterfactual",
    "social+bonding+OR+collective+OR+synchrony+OR+rhythm",
    "memory+OR+episodic+OR+mental+time+travel+OR+scene+construction",
]

high_signal = [
    'aphantasia','hyperphantasia','reality monitoring','source monitoring',
    'mental imagery','visual imagery','motor imagery','vividness',
    'hallucination','inner speech','consciousness','subjective',
    'neural correlate','neural basis','metacognition',
    'mental time travel','scene construction',
    'sense of agency','agency','embodied','embodiment',
    'creativity','mental simulation','counterfactual',
    'cognitive map','placebo','imagination','imaginal',
    'perception','neural representation',
    'predictive processing','predictive coding',
    'bayesian brain','default mode',
    'emotion regulation','emotional imagery',
    'moral reasoning','social cognition',
    'working memory','attention',
    'mind wandering','daydreaming',
    'future thinking','episodic simulation',
    'spatial navigation','mental rotation',
    'body representation','body schema',
    'self-consciousness','minimal self',
    'interoception','cardiac','heartbeat',
    'mindfulness','meditation',
    'music','rhythm','entrainment',
    'synchrony','synchronization',
    'collective','social bonding',
    'ritual','chanting','mantra',
    'motor imagery','action representation',
    'emotion','heart rate variability',
    'autonomic','nervous system',
    'brain connectivity','functional connectivity',
    'resting-state','fMRI','EEG','MEG',
    'neurofeedback','brain-computer',
    'placebo','expectation','prediction',
    'metacognitive','self-awareness',
    'emotional','moral','aesthetic',
]

all_good = []

for jname, jfilter in journals:
    for topic in topics:
        q = f"({topic})+AND+{jfilter}+AND+2022:2026[pdat]"
        url = f"{BASE}/esearch.fcgi?db=pubmed&term={q}&retmax=4&retmode=json"
        
        try:
            fetch(url, "/tmp/_p10_tmp.json")
            with open("/tmp/_p10_tmp.json") as f:
                data = json.load(f)
            ids = data.get('esearchresult',{}).get('idlist',[])
            if not ids: continue
            
            url2 = f"{BASE}/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
            fetch(url2, "/tmp/_p10_tmp2.json")
            
            with open("/tmp/_p10_tmp2.json") as f:
                summaries = json.load(f)
            
            for pmid in ids:
                s = summaries.get('result',{}).get(pmid,{})
                title = (s.get('title') or '').strip()
                tl = title.lower()
                
                bad = ['tumor','cancer','surgery','segmentation','deep learning',
                       'detection','classification','therapy','clinical trial',
                       'patient','mortality','biomarker','risk factor','prognostic',
                       'protocol','systematic review','meta-analysis','randomized']
                if any(k in tl for k in bad): continue
                
                score = sum(2 for k in high_signal if k in tl)
                
                if score >= 2:
                    source = s.get('source','')
                    year = (s.get('pubdate') or '')[:4]
                    author = [x.get('name','') for x in s.get('authors',[])][:1]
                    doi = (s.get('elocationid') or '').replace('doi: ','')
                    
                    all_good.append({
                        'pmid': pmid, 'title': title, 'source': source,
                        'year': year, 'author': author[0] if author else '?',
                        'doi': doi, 'score': score
                    })
        except:
            pass
        time.sleep(0.4)

# Deduplicate
seen = set()
unique = []
for p in all_good:
    if p['pmid'] not in seen:
        seen.add(p['pmid'])
        unique.append(p)

unique.sort(key=lambda x: -x['score'])

print(f"Phase 10: {len(unique)} high-signal papers from OA journals")
print("=" * 60)
for p in unique:
    tag = '✅✅' if p['score'] >= 6 else '✅'
    print(f"{tag} {p['title'][:90]}")
    print(f"   {p['author']} | {p['source']} {p['year']} | PMID:{p['pmid']}")
    print()
