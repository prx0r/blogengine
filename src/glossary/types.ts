export interface BodyBlock {
  kind: "source" | "ai" | "summary" | "art";
  text?: string;
  art_id?: string;
  caption?: string;
}

export interface GlossaryArt {
  id: string;
  title: string;
  artist?: string;
  date?: string;
  source_url?: string;
  image_url?: string;
  local_file?: string;
  license?: string;
  description?: string;
  concepts?: string[];
  visual_motifs?: string[];
  style?: string[];
  used_in?: { type: string; id: string }[];
  motion_notes?: string[];
  notes?: string;
}

export interface GlossarySource {
  id?: string;
  title: string;
  author: string;
  type: string;
  tradition?: string[] | string;
  source_url?: string;
  file_id?: string;
  raw_text?: string;
  clean_text?: string;
  notes?: string;
}

export interface GlossaryEssay {
  id: string;
  title: string;
  type: "condensed_source" | "bridge_essay";
  source_ids: string[];
  author: string;
  concepts: string[];
  prerequisites?: string[] | string;
  art?: string[];
  body: BodyBlock[] | string;
  audioUrl?: string | null;
  notes?: string;
}

export interface GlossaryConcept {
  id: string;
  name: string;
  definition: string;
  tradition: string[] | string;
  synonyms: string[] | string;
  related_to: string[] | string;
  essays?: string[];
  source_material?: string[];
  art?: string[];
}
