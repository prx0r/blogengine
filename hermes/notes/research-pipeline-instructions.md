# Research Acquisition Pipeline — Paper Targets

## Instruction for Hermes Agent

Use your `/acquisition` skill to download papers for each of the following targets. For each paper, try DOI first, then title search via OpenAlex/Crossref. Download to the appropriate `science/` folder.

## Storage Locations

```
library/science/authors/{author_name}/{slug}.pdf
library/science/topics/{topic}/{slug}.pdf  (symlink or copy)
```

## Author Targets (3-10 papers each)

### Michael Levin (Tufts)
Priority papers:
- "Bioelectric networks: the cognitive glue enabling evolutionary scaling from physiology to mind" (2023) — DOI: 10.1007/s10071-023-01780-3
- "The computational boundary of a 'self': Developmental bioelectricity drives multicellularity and scale-free cognition" (2019) — DOI: 10.3389/fpsyg.2019.02688
- "Morphospace: the space of possible anatomical configurations" — search Levin morphospace
- "Platonic space: where cognitive and morphological patterns come from" (2025 thoughtforms.life)
- Any recent Levin + Fields collaborations
- "Bioelectric code: an ancient computational medium" (2018) — DOI: 10.1016/j.biosystems.2017.08.009
- "Endless forms most beautiful 2.0: teleonomy and the bioengineering of chimeric and xenobot organisms" (2023)

### Karl Friston (UCL)
- "The free-energy principle: a unified brain theory?" (2010) — DOI: 10.1038/nrn2787
- "Active inference and learning" (2016) — DOI: 10.1016/j.neubiorev.2016.06.022
- "The variational principles of action" (2019) — search
- "Knowing one's place: a free-energy approach to pattern regulation" (2015) — Friston + Levin
- "A free energy principle for biological systems" (2012) — DOI: 10.3390/e140102100
- "Sentience and the origins of consciousness" (2020)

### Roger Penrose (Oxford)
- "Consciousness in the universe: a review of the 'Orch OR' theory" (2014 with Hameroff) — DOI: 10.1016/j.plrev.2013.08.002
- "On the gravitization of quantum mechanics 1: quantum state reduction" (2014) — DOI: 10.1007/s10701-013-9770-0
- "On the Gravitization of QM 2: Weyl curvature" (2014)
- "The non-computable and the physical" — various
- "Twistor theory: an approach to quantum gravity" — search

### David Deutsch (Oxford)
- "Constructor theory" (2013 Synthese) — DOI: 10.1007/s11229-013-0279-z
- "Quantum theory of computation" (1985) — DOI: 10.1098/rspa.1985.0070
- "Quantum theory, the Church-Turing principle and the universal quantum computer" (1985)
- "The fabric of reality" — book (if available)
- "Everything flows" (2012) — on constructor theory

### David Wallace (Oxford/USC)
- "The emergent multiverse: quantum theory according to the Everett interpretation" (book excerpts)
- "Decoherence and ontology" (various papers)
- "Everett and structure" — search
- "Against the epistemic-interpretation" — search
- "The quantum measurement problem: state of play" — search

### Max Tegmark (MIT)
- "Consciousness as a state of matter" (2015) — DOI: 10.1016/j.chaos.2014.12.014
- "The mathematical universe hypothesis" (2014) — from the book
- "Why the sun is not conscious" (various)
- "Importance of quantum decoherence in brain processes" (2000) — DOI: 10.1103/PhysRevE.61.4194

### Jacob Barandes
- Latest papers on stochastic quantum dynamics / Markovian quantum foundations
- Search: "Barandes quantum" on arxiv
- "A new approach to quantum foundations" (recent)

### Chris Fields
- "Quantum biology: the past and the future" — search
- "If the universe is a quantum computer, where is the programmer?" — search
- "Classical and quantum causality" — search
- Fields + Levin + Glazebrook collaborations
- "The measurement problem as the hard problem" — search

### Mae Wan Ho
- "The rainbow and the worm: the physics of organisms" (book excerpts if available)
- "Quantum coherence and conscious experience" — search
- "Living systems as liquid crystals" — search
- "Bioenergetics and the coherence of life" — search

### Qualia Research Institute (QRI)
- Andres Gomez Emilsson papers and posts
- "The double aspect of information" — search
- "Quantifying valence" — search
- "The combinatorial state space of consciousness" — search
- QRI blog posts on consciousness (qri.org)

## Topic Targets (2-5 papers each)

### Quantum Biology
- "Quantum biology: an introduction" — DOI: 10.1038/nphys3548
- "Quantum effects in biology" (Lambert et al.) — DOI: 10.1038/nphys2681
- "Quantum biology at the cellular level" — search
- "Quantum tunneling in biological systems" — search

### Platonic Biology / Morphospace
- All Levin morphospace papers
- "Anatomical attractors" — search
- "Form in biology: the Platonic view" — search

### Complexity Science
- "The origins of order" (Kauffman book excerpts)
- "Investigations" (Kauffman)
- "The edge of chaos" — Langton
- "Complexity: the emerging science at the edge of order and chaos" — search

### Constructor Theory
- Deutsch constructor theory papers
- Marletto's papers on constructor theory
- "Constructor theory of information" — search

### Quantum Foundations
- Leggett-Garg inequalities
- Bell's theorem reviews
- Contextuality papers
- Spekkens' toy model

### Assembly Theory
- "Assembly theory explains and quantifies selection and evolution" (2023 Nature) — DOI: 10.1038/s41586-023-06600-9
- Walker and Cronin papers on assembly theory
- "Identifying molecules as biosignatures with assembly theory" — search

### Mathematics — Seminal Modern
- Amplituhedron: Arkani-Hamed + Trnka — "The amplituhedron" (2014) — DOI: 10.1007/JHEP10(2014)030
- "Positive grassmannian and scattering amplitudes" — search
- "Geometric unity" — search (if available)
- "Von Neumann self-reproducing automata" — search
- "Cellular automata and computation" — Wolfram, Cook

## Execution

Process in this order:
1. Start with Michael Levin (highest priority — direct bridge to the constraint space framework)
2. QRI (qualia computing — maps to the S0 theory)
3. Friston (free energy — maps to karmic update rule)
4. Barandes (quantum foundations — maps to measurement as instantiation)
5. Then the remaining authors in any order
6. Finish with topic searches

For each successful acquisition, log it to `hermes/notes/t2-acquisition-log.md`.
