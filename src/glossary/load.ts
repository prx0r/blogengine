import { GLOSSARY_ESSAYS, GLOSSARY_CONCEPTS, GLOSSARY_SOURCES, GLOSSARY_ART } from "./generated-data";
import type { GlossaryEssay, GlossaryConcept, GlossarySource, GlossaryArt } from "./types";

const essays = GLOSSARY_ESSAYS as GlossaryEssay[];
const concepts = GLOSSARY_CONCEPTS as GlossaryConcept[];
const sources = GLOSSARY_SOURCES as GlossarySource[];
const art = GLOSSARY_ART as GlossaryArt[];

export function getGlossaryEssays(): GlossaryEssay[] {
  return [...essays].filter((e): e is GlossaryEssay => typeof e === "object" && e !== null && "title" in e).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
}

export function getGlossaryEssay(id: string): GlossaryEssay | null {
  return essays.find(e => e.id === id) ?? null;
}

export function getGlossaryConcepts(): GlossaryConcept[] {
  return [...concepts].filter((c): c is GlossaryConcept => typeof c === "object" && c !== null && "name" in c).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export function getGlossaryConcept(id: string): GlossaryConcept | null {
  return concepts.find(c => c.id === id) ?? null;
}

export function getGlossarySources(): GlossarySource[] {
  return [...sources];
}

export function getGlossarySource(id: string): GlossarySource | null {
  return sources.find(s => s.id === id) ?? null;
}

export function getGlossaryArt(): GlossaryArt[] {
  return [...art];
}

export function getGlossaryArtById(id: string): GlossaryArt | null {
  return art.find(a => a.id === id) ?? null;
}

export function getArtByConcept(conceptName: string): GlossaryArt[] {
  return art.filter(a => a.concepts?.includes(conceptName));
}
