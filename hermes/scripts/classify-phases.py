#!/usr/bin/env python3
"""Categorize all bridge essays into the 17 phases of the Path of Re-Rendering.
   Moves PDFs into library/arxiv/phase-N-name/ and updates essay JSONs."""
import json, os, re, shutil
from collections import defaultdict

ESSAY_DIR = "/root/projects/blog/content/glossary/essays"
WORK_DIR = "/root/projects/blog/content/works"
LIB_BASE = "/root/projects/blog/library/arxiv"

# Phase classification rules
PHASES = {
    "phase-1-dashboard": {
        "name": "Dashboard Diagnosis",
        "keywords": ["predictive processing", "predictive coding", "bayesian brain", "active inference",
                     "free energy principle", "prediction error", "perceptual inference",
                     "generative model", "hierarchical inference", "precision weighting"],
        "weights": {"predictive": 2, "active inference": 3, "free energy": 2}
    },
    "phase-2-desolidification": {
        "name": "Physical Desolidification",
        "keywords": ["quantum", "emergence", "nonlinear dynamics", "complex systems",
                     "self-organization", "morphogenesis", "bioelectricity", "pattern formation"],
        "weights": {}
    },
    "phase-3-mind-computer": {
        "name": "Mind as Computer Critique",
        "keywords": ["4e cognition", "embodied cognition", "enactive", "situated cognition",
                     "extended mind", "embedded cognition", "dynamical systems", "enactivism",
                     "embodied-enactive", "interactive brain"],
        "weights": {"4e": 3, "embodied": 2, "enactive": 2}
    },
    "phase-4-nested-agency": {
        "name": "Nested Agency",
        "keywords": ["agency", "sense of agency", "nested agency", "distributed agency",
                     "bioelectric", "bioelectricity", "morphogenesis", "regeneration",
                     "planarian", "xenopus", "somatic computation", "cellular automata",
                     "developmental", "swarm", "collective intelligence"],
        "weights": {"agency": 2, "bioelectric": 3, "morphogenesis": 2, "levin": 3}
    },
    "phase-5-mechanicality": {
        "name": "Mechanicality",
        "keywords": ["habit", "automaticity", "default mode network", "default mode",
                     "habitual", "chunking", "automatic", "compulsive",
                     "mind wandering", "mind-wandering", "daydreaming"],
        "weights": {"default mode": 3, "habit": 2, "mind wandering": 2}
    },
    "phase-6-dependent-arising": {
        "name": "Dependent Arising",
        "keywords": ["self", "ego", "self-consciousness", "selfhood", "minimal self",
                     "narrative self", "self-referential", "depersonalization",
                     "self-transcendence", "ego dissolution", "selflessness",
                     "buddhist", "non-self", "emptiness", "annatta", "anatta",
                     "consciousness", "phenomenal", "subjective experience"],
        "weights": {"self": 1, "ego": 2, "consciousness": 2}
    },
    "phase-7-emptiness": {
        "name": "Emptiness / Madhyamaka",
        "keywords": ["emptiness", "madhyamaka", "non-dual", "nondual",
                     "non-duality", "nagarjuna", "sunyata", "shunyata",
                     "buddhist philosophy", "middle way", "two truths"],
        "weights": {"non-dual": 3, "emptiness": 3, "nondual": 3}
    },
    "phase-8-non-fabrication": {
        "name": "Non-Fabrication",
        "keywords": ["meditation", "mindfulness", "non-fabrication", "choiceless awareness",
                     "open monitoring", "focused attention", "vipassana", "shamatha",
                     "meditator", "long-term meditator", "meditation experience",
                     "mindfulness meditation", "buddhist meditation",
                     "breath", "breathing", "respiratory", "respiration"],
        "weights": {"meditation": 2, "mindfulness": 2}
    },
    "phase-9-language-mantra": {
        "name": "Language / Sign / Mantra",
        "keywords": ["mantra", "chanting", "inner speech", "private speech",
                     "language", "semiotics", "verbal", "narrat",
                     "self-talk", "auditory verbal", "phonological",
                     "speech perception", "voice", "linguistic"],
        "weights": {"mantra": 3, "chanting": 3, "inner speech": 3}
    },
    "phase-10-imaginal": {
        "name": "Imaginal Reconstruction",
        "keywords": ["mental imagery", "visual imagery", "imagination", "aphantasia",
                     "hyperphantasia", "imagery vividness", "visual imagination",
                     "mental image", "imaginal", "mental simulation",
                     "imagination perception", "visual mental",
                     "mind's eye", "mental rotation", "spatial imagery",
                     "motor imagery", "action imagery", "kinesthetic imagery",
                     "creative cognition", "creativity", "divergent thinking",
                     "pareidolia", "counterfactual", "future thinking"],
        "weights": {"imagery": 2, "aphantasia": 3, "imagination": 2, "vividness": 2}
    },
    "phase-11-body-energy": {
        "name": "Body / Energy",
        "keywords": ["interoception", "interoceptive", "cardiac", "heartbeat",
                     "heart-brain", "heart rate variability", "hrv",
                     "bodily self", "body ownership", "body representation",
                     "rubber hand", "embodiment", "embodied",
                     "gut-brain", "gut microbiota", "enteric",
                     "autonomic", "vagal", "visceral",
                     "insular cortex", "insula", "somatic",
                     "proprioception", "proprioceptive", "body schema"],
        "weights": {"interoception": 3, "cardiac": 2, "bodily": 2, "embodiment": 1}
    },
    "phase-12-ritual": {
        "name": "Ritual Re-rendering",
        "keywords": ["music", "rhythm", "entrainment", "synchrony", "synchronization",
                     "interpersonal synchrony", "neural synchrony", "brain synchrony",
                     "hyperscanning", "inter-brain", "interbrain",
                     "joint action", "social bonding", "group cohesion",
                     "collective", "dyadic", "coordination",
                     "ritual", "dance", "musical improvisation",
                     "chorus", "choir", "singing",
                     "audience", "live performance", "music therapy"],
        "weights": {"synchrony": 2, "entrainment": 3, "hyperscanning": 3, "music": 2}
    },
    "phase-13-daimon": {
        "name": "Daimon Guidance",
        "keywords": ["hallucination", "hallucinations", "voice hearing",
                     "auditory verbal hallucination", "avh", "inner speech",
                     "psychosis", "schizophrenia", "psychotic",
                     "voice hearer", "non-clinical voice", "voice-selective",
                     "agency", "sense of agency", "source monitoring",
                     "reality monitoring", "self-monitoring",
                     "corollary discharge", "efference copy",
                     "metacognition", "metacognitive", "insight",
                     "self-other", "source monitoring"],
        "weights": {"hallucination": 3, "voice hearing": 3, "psychosis": 2, "agency": 1}
    },
    "phase-14-nonordinary": {
        "name": "Nonordinary Rendering",
        "keywords": ["psychedelic", "psilocybin", "dmt", "lsd", "ayahuasca",
                     "altered state", "ego dissolution", "mystical experience",
                     "entropic brain", "psychedelic therapy", "hallucinogen",
                     "ketamine", "mdma", "serotonergic",
                     "hypnosis", "hypnotic", "trance",
                     "lucid dream", "dream", "sleep",
                     "locked-in", "near-death", "out-of-body"],
        "weights": {"psychedelic": 3, "psilocybin": 3, "ego dissolution": 3, "dmt": 3}
    },
    "phase-15-ecology-animism": {
        "name": "Ecology / Animism",
        "keywords": ["nature", "biophilia", "green space", "greenspace",
                     "forest", "natural environment", "outdoor",
                     "animism", "ecological", "environment",
                     "restorative", "attention restoration",
                     "connectedness to nature", "nature exposure",
                     "biophilic", "wilderness"],
        "weights": {"nature": 2, "biophilia": 3, "restorative": 2}
    },
    "phase-16-visionary-cosmologies": {
        "name": "Visionary Cosmologies",
        "keywords": ["panpsychism", "panpsychist", "idealism", "cosmopsychism",
                     "mystical", "transcendent", "transcendence",
                     "spiritual", "spirituality", "religion",
                     "religious experience", "mystical experience",
                     "self-transcendence", "awe", "wonder",
                     "god", "divine", "prayer", "praying",
                     "numinous", "sacred", "contemplative"],
        "weights": {"panpsychism": 3, "mystical": 2, "transcendence": 2, "spiritual": 1}
    },
    "phase-17-social-incarnation": {
        "name": "Social Incarnation",
        "keywords": ["social cognition", "social neuroscience", "second-person",
                     "theory of mind", "mentalizing", "empathy",
                     "prosocial", "social bonding", "social interaction",
                     "attachment", "mother-infant", "parent-child",
                     "social brain", "social network",
                     "collective", "group", "cooperation",
                     "moral", "ethics", "value",
                     "communication", "conversation", "dialogue",
                     "culture", "cultural", "social media"],
        "weights": {"social": 1, "empathy": 2, "attachment": 2, "mentalizing": 2}
    }
}

def classify_essay(title, body_text=""):
    """Classify an essay into the best phase based on title and first 500 chars of body."""
    text = (title + " " + " ".join(body_text.split()[:100])).lower()
    scores = {}
    
    for phase_id, phase_info in PHASES.items():
        score = 0
        for kw in phase_info["keywords"]:
            if kw in text:
                score += 1
            # Check for compound keywords
            if kw.replace("-", " ") in text:
                score += 1
        # Apply weights
        for kw, w in phase_info.get("weights", {}).items():
            if kw in text:
                score += w
        if score > 0:
            scores[phase_id] = score
    
    if not scores:
        return None
    
    # Return highest-scoring phase
    return max(scores, key=scores.get)

# Track results
phase_counts = defaultdict(int)
uncategorized = []

# Create phase directories
for pid in PHASES:
    os.makedirs(f"{LIB_BASE}/{pid}", exist_ok=True)

# Scan all essays
for fname in sorted(os.listdir(ESSAY_DIR)):
    if not fname.endswith('.json'): continue
    
    path = os.path.join(ESSAY_DIR, fname)
    try:
        with open(path) as f:
            essay = json.load(f)
    except:
        continue
    
    slug = essay.get('id', fname.replace('.json', ''))
    title = essay.get('title', '')
    body = essay.get('body', [])
    
    # Get first block text for classification
    first_text = ""
    if body:
        b = body[0]
        if isinstance(b, dict) and 'text' in b:
            first_text = b['text']
        elif isinstance(b, str):
            first_text = b
    
    # Find matching phase
    phase = classify_essay(title, first_text)
    
    if phase:
        phase_counts[phase] += 1
        
        # Update essay JSON with phase info
        if "phases" not in essay:
            essay["phases"] = []
        if phase not in essay.get("phases", []):
            if "phases" not in essay:
                essay["phases"] = []
            essay["phases"] = essay.get("phases", [])
            if phase not in essay["phases"]:
                essay["phases"].append(phase)
            with open(path, 'w') as f:
                json.dump(essay, f, indent=2)
    else:
        uncategorized.append((slug, title[:60]))

# Report
total = sum(phase_counts.values()) + len(uncategorized)
print(f"\n{'='*60}")
print(f"PHASE CLASSIFICATION RESULTS ({total} essays)")
print(f"{'='*60}\n")

for pid in sorted(PHASES.keys()):
    count = phase_counts.get(pid, 0)
    name = PHASES[pid]["name"]
    bar = "█" * min(count // 5, 40)
    print(f"{pid:<30s} {count:>4d} {bar}")

print(f"\nUncategorized: {len(uncategorized)}")
for slug, title in uncategorized[:20]:
    print(f"  ? {title}")

print(f"\n{'='*60}")
print("Phase directories created at library/arxiv/phase-N-name/")
print("Essay JSONs updated with 'phases' field.")
print("Move PDFs to phase dirs with:")
print("  python3 organize-pdfs.py")
