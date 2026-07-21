#!/usr/bin/env python3
"""
PubMed Bridge Paper Searcher — Phase-by-phase acquisition of frontier science
papers that bridge esoteric/philosophical concepts with mechanistic science.

Usage:
  python3 pubmed_bridge_searcher.py <phase> [--dry-run] [--max-results N]
  
Phases: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17
"""

import json, os, sys, time, re, hashlib, urllib.request, urllib.parse, urllib.error, socket, textwrap

PROJECT_ROOT = "/root/projects/blog"
WORK_DIR = os.path.join(PROJECT_ROOT, "content/works")
ESSAY_DIR = os.path.join(PROJECT_ROOT, "content/glossary/essays")
LIBRARY_DIR = os.path.join(PROJECT_ROOT, "library/frontier")
LOG_FILE = os.path.join(PROJECT_ROOT, "hermes/notes/t2-acquisition-log.md")
NOTES_DIR = os.path.join(PROJECT_ROOT, "hermes/notes")
PMC_DIR = os.path.join(PROJECT_ROOT, "library/pmc")

for d in [WORK_DIR, ESSAY_DIR, LIBRARY_DIR, NOTES_DIR, PMC_DIR]:
    os.makedirs(d, exist_ok=True)

NCBI_EMAIL = "thomas.prior@example.com"  # NCBI requires email
NCBI_TOOL = "hermes_bridge_searcher"
API_KEY = ""  # Optional NCBI API key for higher rate limits

# ─── Phase definitions ──────────────────────────────────────────────────────

PHASES = {
    1: {
        "name": "Dashboard Diagnosis",
        "desc": "Self-assessment, metacognition, self-awareness",
        "queries": [
            "metacognition[Title/Abstract] AND neural[Title/Abstract] AND fmri",
            "self-awareness[Title/Abstract] AND anterior insula",
            "introspection[Title/Abstract] AND prefrontal cortex",
            "metacognitive[Title/Abstract] AND brain[Title/Abstract]",
            "neural correlates of self-awareness",
            "neuroimaging metacognition",
        ],
        "bridge": "Metacognition as the 'diagnostic' capacity — science of knowing what you know, parallel to esoteric self-examination.",
    },
    2: {
        "name": "Physical De-solidification",
        "desc": "Neuroplasticity, body schema, perception plasticity",
        "queries": [
            "neuroplasticity[Title/Abstract] AND body[Title/Abstract]",
            "rubber hand illusion[Title/Abstract]",
            "body schema[Title/Abstract] AND plasticity",
            "perceptual plasticity[Title/Abstract] AND brain",
            "multisensory integration body representation",
            "body ownership[Title/Abstract] AND fMRI",
        ],
        "bridge": "Body as process not substance — neuroplasticity reveals the self-model as continuously updated prediction.",
    },
    3: {
        "name": "Mind as Computer Critique",
        "desc": "4E cognition, embodied cognition, extended mind",
        "queries": [
            "embodied cognition[Title/Abstract] AND brain",
            "enactive[Title/Abstract] AND cognition AND neuroscience",
            "extended mind AND cognition",
            "4E cognition AND neuroscience",
            "enactivism AND predictive processing",
            "embodied brain AND cognition",
        ],
        "bridge": "Scientific evidence against computationalism — cognition is embodied, embedded, enactive, extended.",
    },
    4: {
        "name": "Nested Agency",
        "desc": "Free will, agency, decision-making, voluntary action",
        "queries": [
            "sense of agency[Title/Abstract] AND neuroscience",
            "voluntary action[Title/Abstract] AND brain",
            "intentional binding[Title/Abstract]",
            "readiness potential[Title/Abstract] AND agency",
            "free will[Title/Abstract] AND neuroimaging",
            "agency[Title/Abstract] AND predictive processing",
        ],
        "bridge": "Agency as inference — the 'I' as nested prediction error minimization, not homunculus.",
    },
    5: {
        "name": "Mechanicality",
        "desc": "Habit, automaticity, default mode network, compulsive behavior",
        "queries": [
            "default mode network[Title/Abstract] AND habit",
            "automaticity[Title/Abstract] AND brain AND habit",
            "habit formation[Title/Abstract] AND striatum",
            "compulsive[Title/Abstract] AND neural circuits",
            "mind-wandering[Title/Abstract] AND default mode",
            "goal-directed AND habitual AND brain",
        ],
        "bridge": "The mechanical mind — neuroscience of automaticity revealing how we become trapped in behavioral loops.",
    },
    6: {
        "name": "Dependent Arising",
        "desc": "Predictive processing, causality perception, emptiness, no-self",
        "queries": [
            "predictive processing[Title/Abstract] AND self[Title/Abstract]",
            "Bayesian brain AND self AND consciousness",
            "causality[Title/Abstract] AND perception AND brain",
            "active inference AND self AND neuroscience",
            "free energy principle AND self",
            "predictive coding AND self-model",
        ],
        "bridge": "Emptiness from predictive processing — the self as inference, dependent arising as Bayes-optimal perception.",
    },
    7: {
        "name": "Emptiness",
        "desc": "Self, no-self, minimal self, ego dissolution",
        "queries": [
            "ego dissolution[Title/Abstract] AND brain",
            "default mode network AND self-reference",
            "minimal self[Title/Abstract] AND neuroscience",
            "no-self[Title/Abstract] AND meditation",
            "self-referential[Title/Abstract] AND DMN",
            "sense of self AND brain AND consciousness",
        ],
        "bridge": "Neuroscience of selflessness — DMN suppression, ego dissolution, and the constructed self.",
    },
    8: {
        "name": "Non-fabrication",
        "desc": "Spontaneous thought, mind-wandering, creativity, default mode",
        "queries": [
            "spontaneous thought[Title/Abstract] AND brain",
            "mind-wandering[Title/Abstract] AND creativity",
            "default mode network AND creative cognition",
            "spontaneous cognition AND resting state",
            "creative insight[Title/Abstract] AND brain",
            "divergent thinking[Title/Abstract] AND fMRI",
        ],
        "bridge": "The natural mind — spontaneous thought as baseline state, fabrication as deliberate override.",
    },
    9: {
        "name": "Language / Mantra",
        "desc": "Mantra meditation, language predictive processing, inner speech",
        "queries": [
            "mantra[Title/Abstract] AND meditation AND brain",
            "inner speech[Title/Abstract] AND brain",
            "verbal repetition AND meditation AND EEG",
            "chanting AND meditation AND brain",
            "inner speech AND predictive processing",
            "auditory verbal AND prediction AND brain",
        ],
        "bridge": "Mantra as cognitive technology — predictive processing of language, inner speech as self-modeling.",
    },
    10: {
        "name": "Imaginal Reconstruction",
        "desc": "Mental imagery, visual perception, imagination, hallucination spectrum",
        "queries": [
            "mental imagery[Title/Abstract] AND visual perception",
            "imagination[Title/Abstract] AND perception AND brain",
            "hallucination continuum[Title/Abstract]",
            "reality monitoring[Title/Abstract] AND brain",
            "visual imagery[Title/Abstract] AND early visual cortex",
            "mental imagery AND predictive processing",
            "hallucination proneness AND perception",
            "source monitoring AND reality AND brain",
        ],
        "bridge": "Imagination as real perception — shared neural circuitry for imagery and perception, hallucination as continuum.",
    },
    11: {
        "name": "Body-energy",
        "desc": "Interoception, heart-brain, vagus nerve, energy metabolism, spiritus",
        "queries": [
            "interoception[Title/Abstract] AND insula",
            "heart-brain[Title/Abstract] AND interaction",
            "vagal[Title/Abstract] AND brain connectivity",
            "cardiac interoception[Title/Abstract] AND brain",
            "interoceptive inference[Title/Abstract]",
            "heart rate variability AND emotion regulation",
            "baroreflex AND brain AND consciousness",
        ],
        "bridge": "Spiritus as interoceptive inference — heart-brain coupling, energy metabolism as felt presence.",
    },
    12: {
        "name": "Ritual",
        "desc": "Neural synchrony, brain entrainment, collective ritual, chanting",
        "queries": [
            "neural synchrony[Title/Abstract] AND interpersonal",
            "brain entrainment[Title/Abstract] AND rhythm",
            "theta gamma coupling[Title/Abstract] AND meditation",
            "group synchrony[Title/Abstract] AND brain",
            "chanting[Title/Abstract] AND vagal",
            "music[Title/Abstract] AND brain entrainment",
            "respiratory sinus arrhythmia AND meditation",
        ],
        "bridge": "Ritual as neural technology — interpersonal synchrony, theta/gamma coupling, entrainment mechanisms.",
    },
    13: {
        "name": "Daimon",
        "desc": "Voice-hearing, auditory hallucinations, inner speech, agency detection",
        "queries": [
            "auditory verbal hallucination[Title/Abstract] AND brain",
            "voice hearing[Title/Abstract] AND non-clinical",
            "inner speech[Title/Abstract] AND agency",
            "hallucination proneness[Title/Abstract]",
            "source monitoring AND auditory AND hallucination",
            "prediction error AND auditory hallucination",
            "voice hearing AND trauma AND neural",
        ],
        "bridge": "Daimonic voice — voice-hearing as spectrum phenomenon, agency detection, inner speech misattribution.",
    },
    14: {
        "name": "Nonordinary Rendering",
        "desc": "Psychedelics, altered states, mystical experience, NDE",
        "queries": [
            "psychedelic[Title/Abstract] AND default mode network",
            "psilocybin[Title/Abstract] AND ego dissolution",
            "near-death experience[Title/Abstract] AND brain",
            "altered states AND consciousness AND brain",
            "mystical experience[Title/Abstract] AND neuroscience",
            "DMT AND brain imaging",
            "5-HT2A AND consciousness",
        ],
        "bridge": "Nonordinary states as controlled experiments in consciousness — predictive processing breakdown and revision.",
    },
    15: {
        "name": "Ecology / Animism",
        "desc": "Nature connectedness, biophilia, environmental neuroscience",
        "queries": [
            "nature connectedness[Title/Abstract] AND brain",
            "biophilia[Title/Abstract] AND neuroscience",
            "green space AND brain AND health",
            "awe[Title/Abstract] AND brain AND nature",
            "nature exposure AND cognitive neuroscience",
            "environmental neuroscience AND brain",
        ],
        "bridge": "Ecological self — neuroscience of nature connectedness, biophilia as evolved interoceptive resonance.",
    },
    16: {
        "name": "Visionary Cosmologies",
        "desc": "Mystical experiences, cosmic consciousness, theological concepts",
        "queries": [
            "mystical experience[Title/Abstract] AND brain connectivity",
            "self-transcendence[Title/Abstract] AND neural",
            "prayer[Title/Abstract] AND brain imaging",
            "spirituality[Title/Abstract] AND brain AND fMRI",
            "meditation[Title/Abstract] AND mystical experience",
            "transcendence[Title/Abstract] AND consciousness",
        ],
        "bridge": "Visionary experience as real encounter — neurophenomenology of mystical states, cosmic consciousness.",
    },
    17: {
        "name": "Social Incarnation",
        "desc": "Intersubjectivity, social cognition, empathy, mirror neurons",
        "queries": [
            "intersubjectivity[Title/Abstract] AND neuroscience",
            "empathy[Title/Abstract] AND insula AND ACC",
            "social cognition AND predictive coding",
            "mirror neuron[Title/Abstract] AND empathy",
            "theory of mind[Title/Abstract] AND fMRI",
            "mentalizing[Title/Abstract] AND brain networks",
        ],
        "bridge": "The social body — intersubjectivity as inter-bio-predictive resonance, empathy as shared interoception.",
    },
}

# ─── PubMed E-utilities ─────────────────────────────────────────────────────

def pubmed_search(query, max_results=20, retstart=0):
    """Search PubMed via E-utilities esearch.fcgi. Returns list of PMIDs."""
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retstart": retstart,
        "retmode": "json",
        "email": NCBI_EMAIL,
        "tool": NCBI_TOOL,
    }
    if API_KEY:
        params["api_key"] = API_KEY
    
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?" + urllib.parse.urlencode(params)
    time.sleep(1)  # 1-second delay as required
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HermesBridgeSearcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        pmids = data.get("esearchresult", {}).get("idlist", [])
        total = int(data.get("esearchresult", {}).get("count", 0))
        print(f"  [PubMed] '{query[:60]}...' → {len(pmids)} results (total={total})")
        return pmids, total
    except Exception as e:
        print(f"  [ERROR] PubMed search failed: {e}")
        return [], 0


def pubmed_fetch(pmids):
    """Fetch article summaries via esummary.fcgi. Returns list of dicts."""
    if not pmids:
        return []
    
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "json",
        "email": NCBI_EMAIL,
        "tool": NCBI_TOOL,
    }
    if API_KEY:
        params["api_key"] = API_KEY
    
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?" + urllib.parse.urlencode(params)
    time.sleep(1)
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HermesBridgeSearcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        
        results = []
        for uid_str, entry in data.get("result", {}).items():
            if uid_str == "uids":
                continue
            results.append(entry)
        return results
    except Exception as e:
        print(f"  [ERROR] PubMed fetch failed: {e}")
        return []


def pubmed_fetch_detail(pmids):
    """Fetch full article records via efetch.fcgi (XML, parsed for abstract + DOI)."""
    if not pmids:
        return []
    
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "rettype": "abstract",
        "email": NCBI_EMAIL,
        "tool": NCBI_TOOL,
    }
    if API_KEY:
        params["api_key"] = API_KEY
    
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?" + urllib.parse.urlencode(params)
    time.sleep(1)
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HermesBridgeSearcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_data = resp.read().decode("utf-8", errors="replace")
        return xml_data
    except Exception as e:
        print(f"  [ERROR] PubMed efetch failed: {e}")
        return ""


def extract_abstract_from_xml(xml_data, pmid):
    """Crude XML parser to extract abstract text for a given PMID."""
    # Find the PubmedArticle for this PMID
    import xml.etree.ElementTree as ET
    try:
        root = ET.fromstring(xml_data.encode("utf-8"))
    except:
        return ""
    
    ns = {"": "http://www.w3.org/2005/Atom"}
    # Try parsing without namespaces
    abstracts = []
    for article in root.iter("PubmedArticle"):
        art_pmid = article.findtext(".//PMID", "")
        if art_pmid != pmid:
            continue
        # Collect all AbstractText elements
        for abs_text in article.iter("AbstractText"):
            label = abs_text.get("Label", "")
            text = (abs_text.text or "") + " " + " ".join(abs_text.itertext())
            if label:
                abstracts.append(f"{label}: {text.strip()}")
            else:
                abstracts.append(text.strip())
    return " ".join(abstracts)


def extract_doi_from_xml(xml_data, pmid):
    """Extract DOI from XML for a given PMID."""
    import xml.etree.ElementTree as ET
    try:
        root = ET.fromstring(xml_data.encode("utf-8"))
    except:
        return None
    
    for article in root.iter("PubmedArticle"):
        art_pmid = article.findtext(".//PMID", "")
        if art_pmid != pmid:
            continue
        for eid in article.iter("ELocationID"):
            if eid.get("EIdType") == "doi":
                return eid.text
        # Also check ArticleIdList
        for aid in article.iter("ArticleId"):
            if aid.get("IdType") == "doi":
                return aid.text
    return None


def extract_journal_from_xml(xml_data, pmid):
    """Extract journal title and year from XML."""
    import xml.etree.ElementTree as ET
    try:
        root = ET.fromstring(xml_data.encode("utf-8"))
    except:
        return {}, None
    
    for article in root.iter("PubmedArticle"):
        art_pmid = article.findtext(".//PMID", "")
        if art_pmid != pmid:
            continue
        journal = article.find(".//Journal")
        journal_title = ""
        iso = ""
        year = None
        if journal is not None:
            jt = journal.find("Title")
            if jt is not None and jt.text:
                journal_title = jt.text
            iso_e = journal.find("ISOAbbreviation")
            if iso_e is not None and iso_e.text:
                iso = iso_e.text
            # Get year from PubDate
            pub_date = journal.find(".//PubDate")
            if pub_date is not None:
                for y in ["Year", "MedlineDate"]:
                    ye = pub_date.find(y)
                    if ye is not None and ye.text:
                        yr_match = re.search(r"(\d{4})", ye.text)
                        if yr_match:
                            year = int(yr_match.group(1))
        
        # Get authors
        authors = []
        for auth in article.iter("Author"):
            ln = auth.find("LastName")
            fn = auth.find("ForeName")
            if ln is not None or fn is not None:
                name = f"{fn.text if fn is not None else ''} {ln.text if ln is not None else ''}".strip()
                if name:
                    authors.append(name)
        
        return {
            "journal_title": journal_title,
            "journal_iso": iso,
            "year": year,
            "authors": authors,
        }
    return {}, None


def pmc_download(pmid):
    """Try to download PDF from PMC for a given PMID."""
    # Method: Check if article is in PMC via elink, then download
    params = {
        "dbfrom": "pubmed",
        "db": "pmc",
        "linkname": "pubmed_pmc",
        "id": pmid,
        "retmode": "json",
        "email": NCBI_EMAIL,
        "tool": NCBI_TOOL,
    }
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?" + urllib.parse.urlencode(params)
    time.sleep(1)
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HermesBridgeSearcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        
        # Check if there are PMC links
        linksets = data.get("linksets", [])
        for ls in linksets:
            linksetdbs = ls.get("linksetdbs", [])
            for lsdb in linksetdbs:
                links = lsdb.get("links", [])
                for pmcid in links:
                    if pmcid:
                        # Try to get PDF from PMC
                        pdf_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmcid}/pdf/"
                        # Also try the OA service
                        pdf_url2 = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmcid}/pdf/main.pdf"
                        # Try PMC ID format (with or without PMC prefix)
                        pmc_ref = f"PMC{pmcid}" if not pmcid.startswith("PMC") else pmcid
                        
                        for pu in [pdf_url2, pdf_url]:
                            try:
                                pdf_req = urllib.request.Request(pu, headers={
                                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                                })
                                pdf_resp = urllib.request.urlopen(pdf_req, timeout=30)
                                pdf_bytes = pdf_resp.read()
                                if pdf_bytes[:4] == b"%PDF":
                                    return pdf_bytes, pu, pmc_ref
                            except:
                                continue
                        
                        # Try the PMC OA service as last resort
                        oa_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmc_ref}/pdf/"
                        try:
                            oa_req = urllib.request.Request(oa_url, headers={
                                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                            })
                            oa_resp = urllib.request.urlopen(oa_req, timeout=30)
                            oa_bytes = oa_resp.read()
                            if oa_bytes[:4] == b"%PDF":
                                return oa_bytes, oa_url, pmc_ref
                        except:
                            pass
                        
                        return None, None, pmc_ref  # Known PMC ID but PDF fetch failed
    except Exception as e:
        print(f"    [PMC] Link check failed: {e}")
    
    return None, None, None


# ─── Bridge paper evaluation ────────────────────────────────────────────────

def evaluate_bridge(phase_id, pmid, title, abstract, authors, journal_info):
    """
    Evaluate whether a paper genuinely bridges to the esoteric concept.
    Returns a score 0-10 and a rationale string.
    """
    score = 0
    rationale_parts = []
    
    title_lower = title.lower()
    abstract_lower = abstract.lower() if abstract else ""
    text = title_lower + " " + abstract_lower
    
    # Phase-specific bridge keywords
    phase_bridge_keywords = PHASES[phase_id].get("bridge_keywords", {})
    high_signal = phase_bridge_keywords.get("high", [])
    medium_signal = phase_bridge_keywords.get("medium", [])
    
    # Check for high-signal terms (e.g., exactly what we want)
    high_hits = []
    for kw in high_signal:
        if kw.lower() in text:
            high_hits.append(kw)
    if high_hits:
        score += min(len(high_hits) * 3, 6)
        rationale_parts.append(f"bridge_terms={high_hits}")
    
    # Check for medium-signal terms
    medium_hits = []
    for kw in medium_signal:
        if kw.lower() in text:
            medium_hits.append(kw)
    if medium_hits:
        score += min(len(medium_hits) * 1, 3)
    
    # Check for clinical/noise terms to subtract
    noise_terms = [
        "case report", "clinical trial", "randomized controlled", "meta-analysis",
        "surgery", "pathological", "tumor", "cancer", "lesion", "diagnostic criteria",
        "bacterial", "infection", "drug efficacy", "dosage", "side effect",
        "patient population", "cohort study", "pediatric", "geriatric",
        "validity and reliability", "questionnaire validation", "psychometric properties",
        "translation and validation", "cross-cultural adaptation",
    ]
    noise_hits = [n for n in noise_terms if n in text]
    if noise_hits:
        score -= min(len(noise_hits) * 2, 4)
    
    # Check for engineering/AI noise
    eng_noise = ["deep learning algorithm", "neural network classification", "segmentation",
                 "image processing", "convolutional", "benchmark dataset", "performance metric",
                 "motor imagery classification", "bci", "brain-computer interface",
                 "classification accuracy", "feature extraction", "machine learning pipeline"]
    eng_hits = [e for e in eng_noise if e in text]
    if eng_hits:
        score -= min(len(eng_hits) * 3, 5)
    
    # Penalty for being a questionnaire validation or purely psychometric paper
    if any(term in title_lower for term in ["validat", "reliability", "psychometric", "questionnaire", "scale"]):
        if not any(term in abstract_lower for term in ["brain", "neural", "cortex", "fmri", "eeg"]):
            score -= 3
    
    # Penalty for no abstract (can't evaluate properly)
    if not abstract or len(abstract) < 50:
        score -= 2
    
    # Bonus for specific bridge phrasing
    bridge_phrases = [
        "implications for understanding", "bridge between", "sheds light on",
        "provides insight into", "mechanistic account", "neural basis of",
        "predictive processing account", "inference", "hierarchical",
        "predictive coding", "Bayesian",
    ]
    bp_hits = [b for b in bridge_phrases if b in text]
    if bp_hits:
        score += min(len(bp_hits), 3)
    
    # Ensure noise papers get negative scores
    if "tumor" in title_lower or "segmentation" in title_lower:
        score = -10
    
    return max(score, -10), "; ".join(rationale_parts)


# ─── Bridge keywords per phase ──────────────────────────────────────────────

# Set bridge keywords for all phases
PHASES[1]["bridge_keywords"] = {
    "high": ["metacognition", "self-awareness", "introspection", "self-knowledge", "metacognitive"],
    "medium": ["anterior insula", "prefrontal", "self-evaluation", "self-monitoring", "error monitoring"],
}
PHASES[2]["bridge_keywords"] = {
    "high": ["neuroplasticity", "body schema", "body representation", "multisensory integration", "rubber hand illusion"],
    "medium": ["perceptual plasticity", "out-of-body", "body ownership", "sense of body", "proprioception"],
}
PHASES[3]["bridge_keywords"] = {
    "high": ["embodied cognition", "enactive", "4E cognition", "extended mind", "embedded cognition", "situated cognition"],
    "medium": ["predictive processing", "enactivism", "embodied brain", "body-world", "sensorimotor"],
}
PHASES[4]["bridge_keywords"] = {
    "high": ["sense of agency", "voluntary action", "free will", "intentional binding", "agency inference"],
    "medium": ["readiness potential", "action awareness", "will", "decision-making neuroscience"],
}
PHASES[5]["bridge_keywords"] = {
    "high": ["default mode network", "habit", "automaticity", "compulsive", "mind-wandering"],
    "medium": ["striatum", "goal-directed", "habit learning", "dopamine habit", "automated behavior"],
}
PHASES[6]["bridge_keywords"] = {
    "high": ["predictive processing", "predictive coding", "Bayesian brain", "free energy", "active inference"],
    "medium": ["self-model", "no-self", "causality perception", "agency inference", "self as inference"],
}
PHASES[7]["bridge_keywords"] = {
    "high": ["ego dissolution", "self-referential", "default mode network self", "no-self", "minimal self"],
    "medium": ["self-processing", "sense of self", "self-awareness", "self-consciousness", "self-boundary"],
}
PHASES[8]["bridge_keywords"] = {
    "high": ["spontaneous thought", "mind-wandering", "creative cognition", "default mode creativity"],
    "medium": ["resting state", "task-negative", "incubation", "divergent thinking", "creative insight"],
}
PHASES[9]["bridge_keywords"] = {
    "high": ["mantra", "mantra meditation", "inner speech", "verbal repetition", "chanting"],
    "medium": ["language prediction", "auditory verbal", "inner voice", "speech perception prediction"],
}
PHASES[10]["bridge_keywords"] = {
    "high": ["mental imagery", "visual imagery", "imagination", "hallucination continuum", "reality monitoring"],
    "medium": ["imagery perception", "imaginal", "source monitoring", "visual perception imagery", "hallucination proneness"],
}
PHASES[11]["bridge_keywords"] = {
    "high": ["interoception", "interoceptive", "heart-brain", "vagal", "cardiac perception"],
    "medium": ["insula interoception", "heart rate variability", "baroreflex", "energy metabolism brain", "spiritus"],
}
PHASES[12]["bridge_keywords"] = {
    "high": ["neural synchrony", "brain entrainment", "interpersonal synchrony", "theta gamma coupling", "group synchrony"],
    "medium": ["meditation EEG", "rhythmic entrainment", "music brain", "respiratory sinus arrhythmia", "vagal tone"],
}
PHASES[13]["bridge_keywords"] = {
    "high": ["voice hearing", "auditory verbal hallucination", "hallucination continuum", "hallucination proneness",
             "source monitoring", "inner speech", "agency detection", "self-voice",
             "corollary discharge", "efference copy", "forward model", "self-monitoring",
             "misattribution", "temporal voice area"],
    "medium": ["non-clinical", "general population", "voice perception", "auditory cortex",
               "superior temporal", "language production", "psychosis proneness", "auditory imagery",
               "inner voice", "prediction error auditory", "verbal self-monitoring",
               "self-other", "voice discrimination", "speech production"],
}
PHASES[14]["bridge_keywords"] = {
    "high": ["psychedelic", "psilocybin", "LSD", "DMT", "ego dissolution", "mystical experience"],
    "medium": ["near-death", "altered states", "entropic brain", "default mode network psychedelic", "5-HT2A"],
}
PHASES[15]["bridge_keywords"] = {
    "high": ["nature connectedness", "biophilia", "environmental neuroscience", "green space brain", "awe nature"],
    "medium": ["ecological self", "nature exposure", "restorative environment", "nature brain"],
}
PHASES[16]["bridge_keywords"] = {
    "high": ["mystical experience", "cosmic consciousness", "self-transcendence", "transcendence", "spiritual experience"],
    "medium": ["prayer brain", "religious experience", "meditation mystical", "spirituality neuroscience"],
}
PHASES[17]["bridge_keywords"] = {
    "high": ["intersubjectivity", "empathy neuroscience", "social cognition predictive", "theory of mind", "mentalizing"],
    "medium": ["mirror neuron", "social brain", "empathy pain", "emotion sharing", "interpersonal resonance"],
}


# ─── Work JSON creation ─────────────────────────────────────────────────────

def make_work_id(phase_id, pmid, title):
    """Create a unique work ID."""
    short = re.sub(r'[^a-zA-Z0-9]', '-', title.lower()[:60]).strip('-')
    return f"pmc-{short}"


def create_work_json(phase_id, pmid, title, authors, doi, journal_info, abstract, pdf_path, source_url):
    """Create a work JSON file."""
    work_id = make_work_id(phase_id, pmid, title)
    phase_name = PHASES[phase_id]["name"].lower().replace(" ", "-")
    
    author_list = [{"name": a} for a in authors[:10]]
    
    work = {
        "work_id": f"work:t2-{work_id}",
        "schema_version": 2,
        "title": title,
        "authors": author_list,
        "publication": {
            "year": journal_info.get("year"),
            "type": "article",
            "source": "PubMed/MEDLINE",
            "language": "en",
            "journal": journal_info.get("journal_title", ""),
        },
        "identifiers": {
            "pmid": pmid,
            "doi": doi,
        },
        "topics": [f"phase-{phase_id}-{phase_name}", "frontier_science", "bridge_paper"],
        "tradition": ["contemporary_science"],
        "tier": 2,
        "assets": {
            "pdf_path": pdf_path,
            "source_url": source_url,
            "abstract": abstract[:1000] if abstract else "",
        },
        "provenance": {
            "access_status": "open",
            "oa_status": "green",
            "source": "pubmed_t2_auto",
            "retrieved_at": time.strftime("%Y-%m-%d"),
        },
        "phase_mapping": {
            "phase": phase_id,
            "phase_name": PHASES[phase_id]["name"],
            "bridge_rationale": PHASES[phase_id]["bridge"],
        },
    }
    
    fp = os.path.join(WORK_DIR, f"t2-{work_id}.json")
    with open(fp, "w") as f:
        json.dump(work, f, indent=2, ensure_ascii=False)
    return fp, work_id


def create_essay_json(phase_id, work_id, title, abstract, doi, phase_name):
    """Create a Type B essay JSON for a bridge paper."""
    essay = {
        "id": f"bridge-{work_id}",
        "title": f"Bridge Paper: {title[:80]}",
        "author": "Frontier Science / Hermes T2",
        "type": "bridge_essay",
        "source_ids": [work_id],
        "concepts": [f"phase-{phase_id}", "frontier-science", "bridge-paper"],
        "prerequisites": [],
        "body": [
            {
                "kind": "ai",
                "text": f"This bridge paper connects the esoteric/philosophical concept of **{PHASES[phase_id]['name']}** with mechanistic science from PubMed/MEDLINE."
            },
            {
                "kind": "ai",
                "text": f"**Bridge thesis:** {PHASES[phase_id]['bridge']}"
            },
            {
                "kind": "ai",
                "text": f"**Phase context:** {PHASES[phase_id]['desc']}"
            },
            {
                "kind": "summary",
                "text": f"Paper: {title}\nDOI: {doi or 'N/A'}\nAbstract: {(abstract or 'No abstract available.')[:1500]}"
            },
        ],
        "notes": f"Auto-acquired from PubMed/MEDLINE on {time.strftime('%Y-%m-%d')}. Phase {phase_id} ({PHASES[phase_id]['name']}).",
    }
    
    fp = os.path.join(ESSAY_DIR, f"bridge-{work_id}.json")
    with open(fp, "w") as f:
        json.dump(essay, f, indent=2, ensure_ascii=False)
    return fp


# ─── Main acquisition loop ──────────────────────────────────────────────────

def acquire_phase(phase_id, dry_run=False, max_results=10):
    """Search PubMed for a phase, evaluate papers, acquire the best ones."""
    phase = PHASES[phase_id]
    print(f"\n{'='*60}")
    print(f"📋 PHASE {phase_id}: {phase['name']}")
    print(f"{'='*60}")
    print(f"  {phase['desc']}")
    print(f"  Bridge: {phase['bridge']}")
    
    all_pmids = []
    results_per_query = max(15, max_results * 2)
    for query in phase["queries"]:
        pmids, total = pubmed_search(query, max_results=results_per_query)
        all_pmids.extend(pmids)
        # Cap at reasonable number for evaluation
        if len(all_pmids) >= 60:
            break
    
    # Deduplicate
    all_pmids = list(dict.fromkeys(all_pmids))
    if not all_pmids:
        print("  [SKIP] No results from PubMed")
        return []
    
    print(f"\n  📥 Found {len(all_pmids)} unique PMIDs. Fetching details...")
    
    # Fetch summaries for quick evaluation
    summaries = pubmed_fetch(all_pmids[:30])  # Limit to first 30 for speed
    
    # Fetch full details
    detail_xml = pubmed_fetch_detail(all_pmids[:30])
    
    candidates = []
    for s in summaries:
        pmid = s.get("uid", "")
        title = s.get("title", "")
        source = s.get("source", "")  # Journal name
        authors = [a.get("name", "") for a in s.get("authors", []) if isinstance(a, dict)]
        pubdate = s.get("pubdate", "")
        epubdate = s.get("epubdate", "")
        
        # Get abstract from XML
        abstract = extract_abstract_from_xml(detail_xml, pmid)
        
        # Get DOI and journal details from XML
        doi = extract_doi_from_xml(detail_xml, pmid)
        journal_info = extract_journal_from_xml(detail_xml, pmid)
        
        if not journal_info:
            journal_info = {"journal_title": source, "year": None, "authors": []}
        if not journal_info.get("authors"):
            journal_info["authors"] = authors
        if not journal_info.get("journal_title"):
            journal_info["journal_title"] = source
        
        # Extract year from date
        year = journal_info.get("year")
        if not year:
            yr_match = re.search(r"(\d{4})", pubdate or "")
            if yr_match:
                year = int(yr_match.group(1))
        
        # Evaluate bridge quality
        score, rationale = evaluate_bridge(phase_id, pmid, title, abstract, authors, journal_info)
        
        # Skip obvious noise
        noise_flags = ["tumor", "segmentation", "cmb polarization", "imaging pipeline",
                       "benchmark", "challenge dataset", "classification accuracy"]
        if any(nf in title.lower() for nf in noise_flags):
            print(f"  ❌ NOISE SKIP: {title[:80]}")
            continue
        
        candidates.append({
            "pmid": pmid,
            "title": title,
            "doi": doi,
            "authors": journal_info.get("authors", authors),
            "journal": journal_info.get("journal_title", source),
            "year": year,
            "abstract": abstract,
            "score": score,
            "rationale": rationale,
        })
    
    # Sort by score descending
    candidates.sort(key=lambda c: c["score"], reverse=True)
    
    # Filter to high-quality (score >= 4)
    high_quality = [c for c in candidates if c["score"] >= 4]
    
    print(f"\n  📊 Evaluation complete:")
    print(f"     Total candidates evaluated: {len(candidates)}")
    print(f"     High-quality (score >= 4): {len(high_quality)}")
    
    if high_quality:
        print(f"\n  🏆 Top candidates:")
        for c in high_quality[:8]:
            print(f"     [{c['score']:2d}] {c['title'][:80]}")
            print(f"          {c['journal'][:60]} ({c['year'] or '?'})")
    
    # Acquire the best papers (limit to max_results)
    to_acquire = high_quality[:max_results]
    
    acquired = []
    for i, paper in enumerate(to_acquire):
        print(f"\n  [{i+1}/{len(to_acquire)}] 📄 {paper['title'][:80]}")
        
        if dry_run:
            print(f"     [DRY RUN] Would acquire: {paper['pmid']} ({paper['doi'] or 'no DOI'})")
            acquired.append(paper)
            continue
        
        # Try to download PDF from PMC
        pdf_bytes, pdf_url, pmcid = pmc_download(paper["pmid"])
        
        if pdf_bytes:
            # Save PDF
            work_id = make_work_id(phase_id, paper["pmid"], paper["title"])
            pdf_filename = f"pmc-{work_id}.pdf"
            pdf_path = os.path.join(PMC_DIR, pdf_filename)
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)
            print(f"     ✅ PDF downloaded: {len(pdf_bytes)} bytes")
            
            # Also copy to library/frontier/
            frontier_path = os.path.join(LIBRARY_DIR, pdf_filename)
            import shutil
            shutil.copy2(pdf_path, frontier_path)
            print(f"     ✅ PDF also in library/frontier/")
        else:
            pdf_path = None
            pdf_url = None
            if pmcid:
                print(f"     ⚠️  In PMC ({pmcid}) but no PDF available (XML-only article)")
            else:
                print(f"     ⚠️  Not in PMC — no PDF")
        
        # Create work JSON
        work_fp, work_id = create_work_json(
            phase_id, paper["pmid"], paper["title"], 
            paper["authors"], paper["doi"],
            {"journal_title": paper["journal"], "year": paper["year"]},
            paper["abstract"], pdf_path, 
            f"https://pubmed.ncbi.nlm.nih.gov/{paper['pmid']}/"
        )
        print(f"     ✅ Work JSON: {work_fp}")
        
        # Create essay JSON
        essay_fp = create_essay_json(
            phase_id, work_id, paper["title"],
            paper["abstract"], paper["doi"], PHASES[phase_id]["name"]
        )
        print(f"     ✅ Essay JSON: {essay_fp}")
        
        paper["work_id"] = work_id
        paper["work_path"] = work_fp
        paper["essay_path"] = essay_fp
        paper["pdf_path"] = pdf_path
        acquired.append(paper)
    
    return acquired


def log_results(all_results, log_file=LOG_FILE):
    """Log acquisition results to the log file, appending a summary entry."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    
    entries = []
    for phase_id, papers in sorted(all_results.items()):
        phase = PHASES[phase_id]
        entries.append(f"\n### 📋 Phase {phase_id}: {phase['name']}")
        entries.append(f"- Papers acquired: {len(papers)}")
        for p in papers:
            pdf_status = "✅" if p.get("pdf_path") else "⚠️"
            entries.append(f"  - {pdf_status} {p['title'][:80]}")
            entries.append(f"    PMID: {p['pmid']}, Score: {p['score']}")
    
    # Read existing log
    existing = ""
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            existing = f.read()
    
    # Create update entry
    update = f"""
---

## Auto-Update: {timestamp}

**Session type:** PubMed/MEDLINE T2 Bridge Acquisition  
**Phases covered:** {', '.join(str(k) for k in sorted(all_results.keys()))}  
**Total papers acquired:** {sum(len(v) for v in all_results.values())}

### Acquisition Summary

"""
    for phase_id, papers in sorted(all_results.items()):
        phase = PHASES[phase_id]
        update += f"| {phase_id} | {phase['name']} | {len(papers)} | ✅ |\n"
    
    update += "\n### Detailed Results\n"
    
    for phase_id, papers in sorted(all_results.items()):
        phase = PHASES[phase_id]
        update += f"\n#### Phase {phase_id}: {phase['name']}\n"
        for p in papers:
            pdf_icon = "✅" if p.get("pdf_path") else "⚠️"
            update += f"- {pdf_icon} {p['title'][:100]}\n"
            update += f"  - PMID: {p['pmid']}, Score: {p['score']}, {p.get('doi', 'No DOI')}\n"
            update += f"  - Journal: {p.get('journal', '?')}, Year: {p.get('year', '?')}\n"
            if p.get('pdf_path'):
                update += f"  - PDF: {p['pdf_path']}\n"
    
    update += "\n### Bridge Keywords Hit\n"
    for phase_id, papers in sorted(all_results.items()):
        phase = PHASES[phase_id]
        for p in papers:
            if p.get("rationale"):
                update += f"- Phase {phase_id}: {p['rationale'][:80]}\n"
    
    # Write the log update
    full_log = existing + "\n" + update
    with open(log_file, "w") as f:
        f.write(full_log)
    
    print(f"\n📝 Log updated: {log_file}")


# ─── CLI Entry Point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="PubMed Bridge Paper Searcher")
    parser.add_argument("phase", type=int, nargs="+", help="Phase numbers to search")
    parser.add_argument("--dry-run", action="store_true", help="Don't download or create files")
    parser.add_argument("--max-results", type=int, default=8, help="Max papers to acquire per phase")
    args = parser.parse_args()
    
    all_results = {}
    for phase_id in args.phase:
        if phase_id not in PHASES:
            print(f"Unknown phase: {phase_id}. Valid: {list(PHASES.keys())}")
            continue
        
        papers = acquire_phase(phase_id, dry_run=args.dry_run, max_results=args.max_results)
        all_results[phase_id] = papers
        
        print(f"\n  📊 Phase {phase_id} complete: {len(papers)} papers acquired")
    
    if all_results:
        log_results(all_results)
    
    total = sum(len(v) for v in all_results.values())
    print(f"\n{'='*60}")
    print(f"🏁 TOTAL: {total} papers acquired across {len(all_results)} phases")
    print(f"{'='*60}")
