// @ts-nocheck
import { ESSAYS, SOURCES } from "./generated-essays-data";

export interface Quote {
  speaker: string;
  text: string;
  context: string;
}

export interface Essay {
  id: string;
  sourceId: string;
  title: string;
  body: string;
  category: string;
  audioUrl: string | null;
  tags: string[];
  quotes: Quote[];
  createdAt: string;
}

export interface Source {
  id?: string;
  title: string;
  url?: string;
  date?: string;
  siteName?: string;
  tags?: string[];
  summary?: string;
}

export type Tradition = "Sufism" | "Platonism" | "Occult" | "Tantra" | "Other";

export const TRADITIONS: { id: Tradition; label: string; icon: string; description: string }[] = [
  { id: "Sufism", label: "Sufism", icon: "☾", description: "Islamic mysticism, Ibn Arabi, Corbin, illuminationist philosophy" },
  { id: "Platonism", label: "Platonism", icon: "◇", description: "Neoplatonism, theurgy, Ficino, Iamblichus, Proclus" },
  { id: "Occult", label: "Occult", icon: "△", description: "Western esotericism, magic, ritual, ceremonial practice" },
  { id: "Tantra", label: "Tantra", icon: "🜍", description: "Kashmir Shaivism, Tantraloka, Layayoga, Vijñāna Bhairava, tetrahedron framework" },
  { id: "Other", label: "Other", icon: "○", description: "Goethe, Steiner, Jung, Blake, and cross-tradition works" },
];

const TRADITION_MAP: Record<string, Tradition> = {
  // ── Sufism ──────────────────────────────────────────────
  "corbin_alone_creation_is_not_an_object_the_universe_as_theophany": "Sufism",
  "corbin_alone_sophia_in_mecca_nizm_beauty_and_the_theophany_of_desire": "Sufism",
  "corbin_alone_the_face_that_cannot_be_seen_vision_form_and_the_danger_of_idolatry": "Sufism",
  "corbin_alone_the_god_who_longs_to_be_known_divine_passion_compassion_and_the_birth_of_theophany": "Sufism",
  "corbin_alone_the_heart_that_makes_worlds_real_imagination_mirrors_and_the_subtile_organ": "Sufism",
  "corbin_alone_the_map_the_veil_and_the_method_how_corbin_teaches_us_to_read_ibn_arab": "Sufism",
  "corbin_alone_when_man_prays_god_into_presence_the_method_of_theophanic_prayer": "Sufism",
  "corbin_creative_imagination_v6": "Sufism",
  "mundus_handcrafted_v6": "Sufism",
  "corbin_imago_templi_v6": "Sufism",
  "corbin_imago_templi_type_b": "Sufism",
  "corbin_attar_v6": "Sufism",
  "corbin_avicenna_angel_v6": "Sufism",
  "ibn_arabi_barzakh_v6": "Sufism",
  "suhrawardi-philosophy-of-illumination": "Sufism",
  "mundus-imaginalis-corbin": "Sufism",
  "man-of-light-in-iranian-sufism": "Sufism",
  "becoming_an_angel": "Sufism",
  "becoming_an_angel_beautiful_edition_v6": "Sufism",
  "a-methodology-of-the-imagination": "Sufism",
  "2001_suhrawardi_al_maqtul_the_martyr_of": "Sufism",
  "2011_suhrawardis_realm_of_the_imaginal": "Sufism",
  "ibn_al_arabi_the_doorway_to_an_intellect": "Sufism",
  "ibn_arabi_on_the_benefit_of_knowledge": "Sufism",
  "in_the_end_will_be_consciousness_farghan": "Sufism",
  "rumi_on_traveling_the_path_of_the_prophe": "Sufism",
  "sufism_and_the_path_of_love": "Sufism",
  "suhrawardi_s_creed_of_the_sages": "Sufism",
  "the_philosophy_of_illumination_esoterici": "Sufism",

  // ── Platonism ───────────────────────────────────────────
  "archetypal-psychology-dreamwork-and-neop": "Platonism",
  "demon-est-deus-inversus-honoring-the-dae": "Platonism",
  "eros-and-arithmos": "Platonism",
  "containing-ecstasy-the-strategies-of-iam": "Platonism",
  "ficino_world_living_book_v6": "Platonism",
  "ficino_theurgy_v6": "Platonism",
  "ficino_ladder_of_desire_v6": "Platonism",
  "ficino_divine_madness_v6": "Platonism",
  "ficino_sunlike_eye_v6": "Platonism",
  "ficino_spiritus_v6": "Platonism",
  "ficino_food_putrefaction_gold_milk_blood": "Platonism",
  "ficino_genius_vocation_place": "Platonism",
  "ficino_lunar_medicine": "Platonism",
  "ficino_medicine_cabinet_of_the_soul": "Platonism",
  "ficino_orientation_ficinos_world": "Platonism",
  "ficino_planetary_old_age": "Platonism",
  "ficino_rays_figures_talismanic_image": "Platonism",
  "ficino_song_words_dance_seven_steps": "Platonism",
  "ficino_the_apology": "Platonism",
  "ficino_the_celestial_catalogue": "Platonism",
  "ficino_the_melancholic_scholar": "Platonism",
  "ficino_turn_to_the_living_world": "Platonism",
  "ficino_why_long_life_matters": "Platonism",
  "ficino_why_medicine_for_philosophers": "Platonism",
  "ficino_why_three_books": "Platonism",
  "iamblichus_dreams_possession_and_false_divination": "Platonism",
  "iamblichus_fate_daemon_and_union": "Platonism",
  "iamblichus_how_to_read_an_epiphany": "Platonism",
  "iamblichus_mud_lotus_sacred_names": "Platonism",
  "iamblichus_the_ladder_of_divine_beings": "Platonism",
  "iamblichus_the_priest_replies_to_the_philosopher": "Platonism",
  "iamblichus_theurgy_is_not_coercion": "Platonism",
  "iamblichus_why_matter_can_save_the_soul": "Platonism",
  "theurgy_asclepius_v6": "Platonism",
  "theurgy_iamblichus_v6": "Platonism",
  "theurgy_proclus_v6": "Platonism",
  "theurgy_sallustius_v6": "Platonism",
  "theurgy_plotinus_v6": "Platonism",
  "theurgy_chaldean_v6": "Platonism",
  "corbin_plotinus_beauty_v6": "Platonism",
  "plotinus-article-1": "Platonism",

  // ── Occult ──────────────────────────────────────────────
  "scrying_benjamin_rowe": "Occult",

  // ── Tantra ──────────────────────────────────────────────
  "tantra-tantrica": "Tantra",
  "tantra-tantrica2": "Tantra",
  "tantra-consciousness": "Tantra",
  "tantra-tractatus-finalis": "Tantra",
  "tantra-tantraloka-decoded": "Tantra",
  "tantra-framework-assessment": "Tantra",
  "tantra-monument": "Tantra",
  "tantra-architecture-of-reality": "Tantra",
  "tantra-fundamental-processes": "Tantra",
  "tantra-consciousness-computable": "Tantra",
  "tantra-final-truth": "Tantra",
  "tantra-tetrahedron-math": "Tantra",
  "tantra-36-tattvas": "Tantra",
  "tantra-sanskrit": "Tantra",
  "tantra-tantraloka-reference": "Tantra",
  "tantra-tantraloka-science-thesis": "Tantra",
  "tantra-tetrahedron-framework": "Tantra",
  "tantra-unified-theory": "Tantra",
  "tantra-death-systems": "Tantra",
  "tantra-kabbalah-tetrahedron": "Tantra",
};

function getEssayTradition(essay: any): Tradition {
  return TRADITION_MAP[essay.id] || "Other";
}

export function getSources() {
  return [...SOURCES].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getSource(id: string) {
  return SOURCES.find(s => s.id === id) ?? null;
}

export function getEssays() {
  return [...ESSAYS].sort((a, b) => a.title.localeCompare(b.title));
}

export function getEssay(id: string) {
  return ESSAYS.find(e => e.id === id) ?? null;
}

export function getEssaysBySource(sourceId: string) {
  return ESSAYS.filter(e => e.sourceId === sourceId);
}

export function getAllTags() {
  const tags = new Set<string>();
  for (const s of SOURCES) if (s.tags) for (const t of s.tags) tags.add(t);
  for (const e of ESSAYS) if (e.tags) for (const t of e.tags) tags.add(t);
  return [...tags].sort();
}

export function getEssaysByTag(tag: string) {
  return ESSAYS.filter(e => e.tags?.includes(tag));
}

export function getSourcesByTag(tag: string) {
  return SOURCES.filter(s => s.tags?.includes(tag));
}

export function getEssaysByTradition(tradition: Tradition) {
  return ESSAYS.filter(e => getEssayTradition(e) === tradition)
    .sort((a: any, b: any) => a.title.localeCompare(b.title));
}

export function getEssayWithTradition(id: string) {
  const essay = ESSAYS.find(e => e.id === id) ?? null;
  if (!essay) return null;
  return { ...essay, tradition: getEssayTradition(essay) };
}

export function getEssayTraditionById(id: string): Tradition {
  return TRADITION_MAP[id] || "Other";
}
