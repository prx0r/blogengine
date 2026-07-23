Decision
A Claim Graph layer is introduced above the Ontology Graph.

Architecture:
  Research Object -> Claim Graph -> Ontology Graph -> Semantic Scene -> Visual Plan -> Motion Canvas

Reason
The Claim Graph stores what the text actually says, with provenance:
  Example:
    Tantraloka 1.45
    Claim: "Siva manifests the universe through His freedom."
    subject: Anuttara
    predicate: SELF_MANIFESTS_AS
    object: Universe
    evidence: Tantraloka 1.45
    confidence: TEXTUAL

The ontology then infers: Anuttara -> Sakti -> Abhasa

Consequences
- Every visual can be traced back to a specific passage.
- Scenes can be regenerated when ontology changes.
- Sources can be cited on screen.
- Multiple scholarly interpretations of same passage are supported.
