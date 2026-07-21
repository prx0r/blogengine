# Spellbook Architecture — Intersection with the Engine

## The Chain

```
ActivationPacket (engine)
     ↓
MacroTranslation (planet contexts, timing, conditions)
     ↓
Convergence (planets/themes flagged by 3+ systems)
     ↓
PracticeRecommender → queries spellbook by: planets + conditions + mode
     ↓
SpellEntry[] (practices with procedures, materials, timing, prayers)
     ↓
User sees: "Mars is active and convergent. Practice: Picatrix Mars Courage Operation"
```

## How Spells Connect to Engine States

Every spell is keyed to a **state vector** — not just a planet name, but the full context:

| Engine State | Spell Tag | Example Match |
|---|---|---|
| Planet active at high confidence | `trigger:active:mars` | "Mars Courage Operation" |
| Planet is lord of the year | `trigger:year_lord:saturn` | "Saturn Year Warming Practice" |
| Planet is the daimon and active | `trigger:daimon:mercury` | "Mercurial Writing Practice" |
| Planet is retrograde | `trigger:retrograde:mars` | "Mars Rx Reconsideration" |
| Planet is in detriment | `trigger:detriment:mars` | "Cool Mars Practice" |
| Mode is spirit-led | `trigger:mode:spirit` | "Intention-Setting Ritual" |
| Mode is fortune-led | `trigger:mode:fortune` | "Grounding Practice" |

## Universal SpellEntry Structure

Every practice from every source uses exactly one structure:

```typescript
interface SpellEntry {
  // ── Identity ──
  id: string;                    // "picatrix:ritual:mars:001"
  source: string;                // "Picatrix" | "Ficino" | "Orphic" | "Agrippa" | "PGM" | "Arbatel"
  type: string;                  // "ritual" | "prayer" | "meditation" | "talisman" | "music" | "action"
  
  // ── Trigger conditions (what engine state activates this) ──
  triggers: string[];            // ["trigger:active:mars", "trigger:detriment:mars"]
  planets: string[];             // ["planet:mars"]
  signs?: string[];              // optional sign specificity
  
  // ── Content ──
  title: string;
  summary: string;
  procedure: string[];           // step-by-step (universal)
  incantation?: string;          // prayer or spoken words (optional)
  
  // ── When to do it ──
  timing?: {
    planetaryDay?: number;       // 0=sun...6=saturn
    moonPhase?: string;
    condition?: string;
  };
  
  // ── What you need ──
  materials?: {
    herbs?: string[];
    metals?: string[];
    colours?: string[];
    stones?: string[];
    incenses?: string[];
  };
  
  // ── Safety ──
  safety: "safe_symbolic" | "historical_reference" | "restricted";
  safeAdaptations: string[];
  
  // ── Source ──
  citation: string;              // chapter reference
}
```

## Three Types of Practice, One Structure

All three use the same interface — only the `procedure` content differs:

| Type | Procedure content | Materials? | Incantation? |
|---|---|---|---|
| **Ritual** | "Burn myrrh at dawn on Saturday. Recite the prayer. Walk slowly for 10 minutes." | Usually yes | Optional |
| **Prayer** | "Face east. Recite: 'Hear me, Hermes...'" | Rarely | Required |
| **Meditation** | "Sit quietly. Visualize red light around you." | Rarely | Optional |
| **Music** | "Listen to Dorian mode. Sing the Orphic Hymn to Ares." | Rarely | Optional |
| **Talisman** | "Engrave the image of Mars on iron during Tuesday's Mars hour." | Yes (specific) | Optional |
| **Action** | "Study philosophy for 25 minutes. Practice generosity." | Never | Never |

## How the Recommender Works

```typescript
function recommendPractices(
  macro: MacroTranslation,
  convergence: { planets: string[]; themes: string[] },
  safety: SafetyClass = "historical_reference",
): SpellEntry[] {
  const triggers: string[] = [];
  
  // Build trigger vector from macro
  for (const planet of convergence.planets) {
    triggers.push(`trigger:active:${planet.replace("planet:", "")}`);
    
    const ctx = macro.planets.find(p => `planet:${p.planet}` === planet);
    if (ctx?.isDaimon) triggers.push(`trigger:daimon:${planet.replace("planet:", "")}`);
    if (ctx?.retrograde) triggers.push(`trigger:retrograde:${planet.replace("planet:", "")}`);
    if (ctx?.dignity.includes("detriment")) triggers.push(`trigger:detriment:${planet.replace("planet:", "")}`);
    
    // Check if this planet is the year lord
    if (planet === `planet:${macro.timescales.year.profectionLord}`) {
      triggers.push(`trigger:year_lord:${planet.replace("planet:", "")}`);
    }
  }
  
  if (macro.dominantMode === "spirit") triggers.push("trigger:mode:spirit");
  if (macro.dominantMode === "fortune") triggers.push("trigger:mode:fortune");
  
  // Query spellbook by triggers
  return querySpellbook({ triggers, safety, limit: 5 });
}
```

## Knowledge Graph Integration

Every spell is registered in the knowledge graph:

```
spell:picatrix:ritual:mars:001
  ──practice_for──→ planet:mars
  ──practice_for──→ trigger:active:mars
  ──practice_for──→ trigger:detriment:mars
  ──uses_material──→ corr:herb:basil
  ──uses_material──→ corr:metal:iron
  ──uses_material──→ corr:colour:red
```

This means `clusterByPlanet("planet:mars")` returns:
- Computation data (Mars in Taurus H8)
- Interpretation rules (al-Khayyāt: Mars in H1 = anger)
- Correspondences (herb:basil, metal:iron, colour:red)
- Spells (Picatrix Mars Courage, Orphic Hymn to Ares)
- All connected through the same shared entity ID

## Source Material Priority

| Source | Status | What It Adds | Extractable Content |
|---|---|---|---|
| **Picatrix** | ✅ Text extracted (26K lines) | Full ritual operations: planetary images, suffumigations, prayers, talisman instructions with timing | ~30 entries |
| **Orphic Hymns** | ✅ 2 entries done (5 remaining) | 7 hymns, one per planet, prayer texts | 7 entries |
| **Ficino** | ✅ 4 entries done (6 remaining) | Planetary soul-care practices from De Vita Book 3 | ~10 entries |
| **Agrippa** | ✅ Text available (970K) | Full correspondence tables + planetary operations | ~30 entries |
| **PGM** | ✅ Text available (1.2M) | 100+ spell formulae, speech acts, materials | ~20 entries |
| **Arbatel** | ✅ 7 spirit entries done | 7 Olympic spirits with operations | Done |
| **Skinner** | ⏳ Uploading | 10,000+ definitive correspondence tables | Pending readable file |
