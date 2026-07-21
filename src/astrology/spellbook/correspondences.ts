/**
 * Correspondence Layer — standalone planetary correspondence tables.
 * 
 * Maps planets to herbs, metals, colours, stones, incenses, animals, numbers,
 * days, archangels, and divine names. Independent of any specific spell.
 * 
 * Sources: Agrippa (Three Books of Occult Philosophy, Book II), 
 *          Liber 777 (Crowley), Picatrix, Ficino.
 * 
 * This is queryable by the knowledge graph and provides material data
 * to the spellbook layer. The spellbook references these correspondences
 * by ID rather than duplicating them.
 */

export interface CorrespondenceEntry {
  id: string;                          // "corr:herb:basil"
  type: CorrespondenceType;
  label: string;
  planets: string[];                   // ["planet:mars"]
  signs?: string[];                    // optional sign associations
  source: string;                      // "Agrippa" | "777" | "Picatrix" | "Ficino"
  citation: string;                    // Specific chapter/table reference, e.g. "Agrippa I.23" | "777 Table I"
  notes?: string;
}

export type CorrespondenceType = "herb" | "metal" | "colour" | "stone" | "incense" | "animal" | "number" | "day" | "archangel" | "divine_name" | "musical_note" | "body_part" | "sense" | "spirit";

// ─── Full correspondence tables ───

export const CORRESPONDENCES: CorrespondenceEntry[] = [
  // ── HERBS (Agrippa, Three Books of Occult Philosophy, Book I, Ch. 23–43 on plants) ──
  { id: "corr:herb:frankincense", type: "herb", label: "Frankincense", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.23, I.25; Picatrix II.3" },
  { id: "corr:herb:bay_laurel", type: "herb", label: "Bay Laurel", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.23, I.25" },
  { id: "corr:herb:cinnamon", type: "herb", label: "Cinnamon", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.25" },
  { id: "corr:herb:saffron", type: "herb", label: "Saffron", planets: ["planet:sun", "planet:jupiter"], source: "Agrippa", citation: "Agrippa I.25, I.26" },
  { id: "corr:herb:jasmine", type: "herb", label: "Jasmine", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.24" },
  { id: "corr:herb:lotus", type: "herb", label: "Lotus", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.24" },
  { id: "corr:herb:sandalwood", type: "herb", label: "Sandalwood", planets: ["planet:moon", "planet:venus"], source: "Agrippa", citation: "Agrippa I.24, I.27" },
  { id: "corr:herb:lavender", type: "herb", label: "Lavender", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:herb:mint", type: "herb", label: "Mint", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:herb:fennel", type: "herb", label: "Fennel", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:herb:dill", type: "herb", label: "Dill", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:herb:rose", type: "herb", label: "Rose", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.27" },
  { id: "corr:herb:violet", type: "herb", label: "Violet", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.27" },
  { id: "corr:herb:basil", type: "herb", label: "Basil", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:herb:ginger", type: "herb", label: "Ginger", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:herb:pine", type: "herb", label: "Pine", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:herb:cedar", type: "herb", label: "Cedar", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26" },
  { id: "corr:herb:clove", type: "herb", label: "Clove", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26" },
  { id: "corr:herb:nutmeg", type: "herb", label: "Nutmeg", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26" },
  { id: "corr:herb:myrrh", type: "herb", label: "Myrrh", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:herb:cypress", type: "herb", label: "Cypress", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:herb:patchouli", type: "herb", label: "Patchouli", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:herb:hemlock", type: "herb", label: "Hemlock", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },

  // ── METALS (Agrippa I.22; 777 Table I) ──
  { id: "corr:metal:gold", type: "metal", label: "Gold", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.22; 777 I:1" },
  { id: "corr:metal:silver", type: "metal", label: "Silver", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22; 777 I:2" },
  { id: "corr:metal:mercury_metal", type: "metal", label: "Quicksilver", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.22; 777 I:4" },
  { id: "corr:metal:copper", type: "metal", label: "Copper", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22; 777 I:5" },
  { id: "corr:metal:iron", type: "metal", label: "Iron", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.22; 777 I:6" },
  { id: "corr:metal:tin", type: "metal", label: "Tin", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.22; 777 I:3" },
  { id: "corr:metal:lead", type: "metal", label: "Lead", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.22; 777 I:7" },

  // ── COLOURS (Agrippa II.44; Picatrix II.3; 777 Table VII) ──
  { id: "corr:stone:chrysolite", type: "stone", label: "Chrysolite", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:1" },
  { id: "corr:stone:ruby", type: "stone", label: "Ruby", planets: ["planet:sun", "planet:mars"], source: "Agrippa", citation: "Agrippa I.22; Picatrix II.3" },
  { id: "corr:stone:pearl", type: "stone", label: "Pearl", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:2" },
  { id: "corr:stone:crystal", type: "stone", label: "Crystal", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:stone:agate", type: "stone", label: "Agate", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:4" },
  { id: "corr:stone:emerald", type: "stone", label: "Emerald", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:5" },
  { id: "corr:stone:rose_quartz", type: "stone", label: "Rose Quartz", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:stone:hematite", type: "stone", label: "Hematite", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.22; Picatrix II.3" },
  { id: "corr:stone:sapphire", type: "stone", label: "Sapphire", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:3" },
  { id: "corr:stone:onyx", type: "stone", label: "Onyx", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.22; 777 VII:7" },

  // ── INCENSES (from Agrippa, Picatrix) ──
  { id: "corr:incense:frankincense", type: "incense", label: "Frankincense", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.25; 777 VI:1" },
  { id: "corr:incense:sandalwood", type: "incense", label: "Sandalwood", planets: ["planet:moon", "planet:venus"], source: "Agrippa", citation: "Agrippa I.24, I.27; Picatrix II.3" },
  { id: "corr:incense:lavender", type: "incense", label: "Lavender", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:incense:rose", type: "incense", label: "Rose", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.27; Picatrix II.3" },
  { id: "corr:incense:dragon_blood", type: "incense", label: "Dragon's Blood", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29; Picatrix II.3" },
  { id: "corr:incense:saffron", type: "incense", label: "Saffron", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26; Picatrix II.3" },
  { id: "corr:incense:myrrh", type: "incense", label: "Myrrh", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23; 777 VI:7" },

  // ── DAYS (planetary days of the week) ──
  { id: "corr:day:sunday", type: "day", label: "Sunday", planets: ["planet:sun"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:monday", type: "day", label: "Monday", planets: ["planet:moon"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:tuesday", type: "day", label: "Tuesday", planets: ["planet:mars"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:wednesday", type: "day", label: "Wednesday", planets: ["planet:mercury"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:thursday", type: "day", label: "Thursday", planets: ["planet:jupiter"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:friday", type: "day", label: "Friday", planets: ["planet:venus"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },
  { id: "corr:day:saturday", type: "day", label: "Saturday", planets: ["planet:saturn"], source: "Valens/Agrippa", citation: "Valens I.1; Agrippa II.43" },

  // ── NUMBERS (Agrippa II.22; Qabalistic sephiroth) ──
  { id: "corr:number:1", type: "number", label: "1", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:2", type: "number", label: "2", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:3", type: "number", label: "3", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:4", type: "number", label: "4", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:5", type: "number", label: "5", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:6", type: "number", label: "6", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:7", type: "number", label: "7", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa II.22" },
  { id: "corr:number:8", type: "number", label: "8", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.22" },

  // ── OLYMPIC SPIRITS (Arbatel de Magia Veterum, Aphorisms 16-21) ──
  { id: "corr:spirit:aratron", type: "spirit", label: "Aratron", planets: ["planet:saturn"], source: "Arbatel", citation: "Arbatel Aph.16" },
  { id: "corr:spirit:bethor", type: "spirit", label: "Bethor", planets: ["planet:jupiter"], source: "Arbatel", citation: "Arbatel Aph.17" },
  { id: "corr:spirit:phaleg", type: "spirit", label: "Phaleg", planets: ["planet:mars"], source: "Arbatel", citation: "Arbatel Aph.18" },
  { id: "corr:spirit:och", type: "spirit", label: "Och", planets: ["planet:sun"], source: "Arbatel", citation: "Arbatel Aph.19" },
  { id: "corr:spirit:hagith", type: "spirit", label: "Hagith", planets: ["planet:venus"], source: "Arbatel", citation: "Arbatel Aph.20" },
  { id: "corr:spirit:ophiel", type: "spirit", label: "Ophiel", planets: ["planet:mercury"], source: "Arbatel", citation: "Arbatel Aph.21" },
  { id: "corr:spirit:phul", type: "spirit", label: "Phul", planets: ["planet:moon"], source: "Arbatel", citation: "Arbatel Aph.22" },

  // ── ANIMALS (Agrippa I.23-29; 777) ──
  { id: "corr:animal:lion", type: "animal", label: "Lion", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:eagle", type: "animal", label: "Eagle", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:swan", type: "animal", label: "Swan", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:cat", type: "animal", label: "Cat", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.24" },
  { id: "corr:animal:owl", type: "animal", label: "Owl", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.24" },
  { id: "corr:animal:frog", type: "animal", label: "Frog", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.24" },
  { id: "corr:animal:dog", type: "animal", label: "Dog", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:animal:fox", type: "animal", label: "Fox", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.28" },
  { id: "corr:animal:dove", type: "animal", label: "Dove", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.27" },
  { id: "corr:animal:sparrow", type: "animal", label: "Sparrow", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.27" },
  { id: "corr:animal:wolf", type: "animal", label: "Wolf", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:animal:horse", type: "animal", label: "Horse", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:animal:ram", type: "animal", label: "Ram", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.29" },
  { id: "corr:animal:deer", type: "animal", label: "Deer", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26" },
  { id: "corr:animal:bull", type: "animal", label: "Bull", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.26" },
  { id: "corr:animal:raven", type: "animal", label: "Raven", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:goat", type: "animal", label: "Goat", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:mouse", type: "animal", label: "Mouse", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },
  { id: "corr:animal:serpent", type: "animal", label: "Serpent", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.23" },

  // ── COLOURS (Agrippa II.44; 777 Table VII) ──
  { id: "corr:colour:gold", type: "colour", label: "Gold", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:yellow", type: "colour", label: "Yellow", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:white", type: "colour", label: "White", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:silver", type: "colour", label: "Silver", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:purple", type: "colour", label: "Purple", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:blue", type: "colour", label: "Blue", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:red", type: "colour", label: "Red", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:orange", type: "colour", label: "Orange", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:green", type: "colour", label: "Green", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:pink", type: "colour", label: "Pink", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:yellow_green", type: "colour", label: "Yellow-green", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:grey", type: "colour", label: "Grey", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.44" },
  { id: "corr:colour:black", type: "colour", label: "Black", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.44" },

  // ── DAYS (planetary hours / days of week) ──
  { id: "corr:day:sunday", type: "day", label: "Sunday", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:monday", type: "day", label: "Monday", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:tuesday", type: "day", label: "Tuesday", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:wednesday", type: "day", label: "Wednesday", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:thursday", type: "day", label: "Thursday", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:friday", type: "day", label: "Friday", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa II.10" },
  { id: "corr:day:saturday", type: "day", label: "Saturday", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.10" },

  // ── NUMBERS (Agrippa; 777 Table I) ──
  { id: "corr:number:one", type: "number", label: "1", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa II.4; 777 I:1" },
  { id: "corr:number:two", type: "number", label: "2", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa II.4; 777 I:2" },
  { id: "corr:number:three", type: "number", label: "3", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa II.4; 777 I:3" },
  { id: "corr:number:four", type: "number", label: "4", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa II.4; 777 I:4" },
  { id: "corr:number:five", type: "number", label: "5", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa II.4; 777 I:5" },
  { id: "corr:number:six", type: "number", label: "6", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa II.4; 777 I:6" },
  { id: "corr:number:seven", type: "number", label: "7", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa II.4; 777 I:7" },

  // ── ARCHANGELS (Agrippa III.24; 777) ──
  { id: "corr:archangel:michael", type: "archangel", label: "Michael", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:gabriel", type: "archangel", label: "Gabriel", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:raphael", type: "archangel", label: "Raphael", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:haniel", type: "archangel", label: "Haniel", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:samael", type: "archangel", label: "Samael", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:tzadkiel", type: "archangel", label: "Tzadkiel", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:archangel:zaphkiel", type: "archangel", label: "Zaphkiel", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa III.24" },

  // ── BODY PARTS (Agrippa I.22; Picatrix) ──
  { id: "corr:body_part:heart", type: "body_part", label: "Heart", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:eyes", type: "body_part", label: "Eyes", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:brain", type: "body_part", label: "Brain", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:stomach", type: "body_part", label: "Stomach", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:hands", type: "body_part", label: "Hands", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:lungs", type: "body_part", label: "Lungs", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:kidneys", type: "body_part", label: "Kidneys", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:genitals", type: "body_part", label: "Genitals", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:muscles", type: "body_part", label: "Muscles", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:gall_bladder", type: "body_part", label: "Gall Bladder", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:liver", type: "body_part", label: "Liver", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:thighs", type: "body_part", label: "Thighs", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:legs", type: "body_part", label: "Legs", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:body_part:gall", type: "body_part", label: "Gall", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa I.22" },

  // ── MUSICAL NOTES / PLANETARY TONES (Ficino; Kepler) ──
  { id: "corr:musical_note:c", type: "musical_note", label: "C", planets: ["planet:saturn"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:d", type: "musical_note", label: "D", planets: ["planet:jupiter"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:e", type: "musical_note", label: "E", planets: ["planet:mars"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:f", type: "musical_note", label: "F", planets: ["planet:sun"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:g", type: "musical_note", label: "G", planets: ["planet:venus"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:a", type: "musical_note", label: "A", planets: ["planet:mercury"], source: "Ficino", citation: "De Vita III" },
  { id: "corr:musical_note:b", type: "musical_note", label: "B", planets: ["planet:moon"], source: "Ficino", citation: "De Vita III" },

  // ── SENSES (Agrippa I.22) ──
  { id: "corr:sense:sight", type: "sense", label: "Sight", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:sense:touch", type: "sense", label: "Touch", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:sense:hearing", type: "sense", label: "Hearing", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:sense:smell", type: "sense", label: "Smell", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa I.22" },
  { id: "corr:sense:taste", type: "sense", label: "Taste", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa I.22" },

  // ── DIVINE NAMES (Agrippa III.24; 777) ──
  { id: "corr:divine_name:el", type: "divine_name", label: "El", planets: ["planet:saturn"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:elohim", type: "divine_name", label: "Elohim", planets: ["planet:jupiter"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:elohim_gibor", type: "divine_name", label: "Elohim Gibor", planets: ["planet:mars"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:yah", type: "divine_name", label: "Yah", planets: ["planet:mercury"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:eloha", type: "divine_name", label: "Eloha", planets: ["planet:sun"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:yhvh", type: "divine_name", label: "YHVH", planets: ["planet:venus"], source: "Agrippa", citation: "Agrippa III.24" },
  { id: "corr:divine_name:shaddai", type: "divine_name", label: "Shaddai", planets: ["planet:moon"], source: "Agrippa", citation: "Agrippa III.24" },

  // ── Llewellyn Planetary Spirits (Table 17) ──
  { id: "corr:spirit:zazel", type: "spirit", label: "Zazel", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:hismael", type: "spirit", label: "Hismael", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:bartzabel", type: "spirit", label: "Bartzabel", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:sorath", type: "spirit", label: "Sorath", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:kedemel", type: "spirit", label: "Kedemel", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:taphthartharath", type: "spirit", label: "Taphthartharath", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 17" },
  { id: "corr:spirit:schad", type: "spirit", label: "Schad", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 17" },

  // ── Llewellyn Planetary Intelligences (Table 16) ──
  { id: "corr:spirit:agiel", type: "spirit", label: "Agiel", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:jophiel", type: "spirit", label: "Jophiel", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:graphiel", type: "spirit", label: "Graphiel", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:nakhiel", type: "spirit", label: "Nakhiel", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:hagiel", type: "spirit", label: "Hagiel", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:tiriel", type: "spirit", label: "Tiriel", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 16" },
  { id: "corr:spirit:malka", type: "spirit", label: "Malka", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 16" },

  // ── Llewellyn Archangels (Table 15, alternate tradition) ──
  { id: "corr:archangel:tzaphkiel", type: "archangel", label: "Tzaphkiel", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 15" },
  { id: "corr:archangel:khamael", type: "archangel", label: "Khamael", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 15" },
  { id: "corr:archangel:uriel", type: "archangel", label: "Uriel", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 15" },

  // ── Llewellyn Divine Names (Table 5) ──
  { id: "corr:divine_name:yahveh_elohim", type: "divine_name", label: "Yahveh Elohim", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 5" },
  { id: "corr:divine_name:elohim_gibor", type: "divine_name", label: "Elohim Gibor", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 5" },
  { id: "corr:divine_name:eloa_va_daath", type: "divine_name", label: "Eloa va-daath", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 5" },
  { id: "corr:divine_name:jahveh_sabaoth", type: "divine_name", label: "Jahveh Sabaoth", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 5" },
  { id: "corr:divine_name:elohim_sabaoth", type: "divine_name", label: "Elohim Sabaoth", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 5" },
  { id: "corr:divine_name:shaddai_el_chi", type: "divine_name", label: "Shaddai El Chi", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 5" },

  // ── Llewellyn Complete Book of Ceremonial Magick (Book Three: Planetary Magic, David Rankine) ──
  // Adds modern planetary correspondences from Table 19, 21, 23. Extends existing Agrippa/777 data.
  { id: "corr:metal:brass", type: "metal", label: "Brass", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 19" },
  { id: "corr:metal:aluminium", type: "metal", label: "Aluminium", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 19" },
  { id: "corr:stone:cat_s_eye", type: "stone", label: "Cat's-eye", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:sunstone", type: "stone", label: "Sunstone", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:tiger_s_eye", type: "stone", label: "Tiger's-eye", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:topaz", type: "stone", label: "Topaz", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:zircon", type: "stone", label: "Zircon", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:diamond", type: "stone", label: "Diamond", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:aventurine", type: "stone", label: "Aventurine", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:citrine_quartz", type: "stone", label: "Citrine quartz", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:labradorite", type: "stone", label: "Labradorite", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:opal", type: "stone", label: "Opal", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:amazonite", type: "stone", label: "Amazonite", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:jade", type: "stone", label: "Jade", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:peridot", type: "stone", label: "Peridot", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:zoisite", type: "stone", label: "Zoisite", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:aquamarine", type: "stone", label: "Aquamarine", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:beryl", type: "stone", label: "Beryl", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:chalcedony", type: "stone", label: "Chalcedony", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:moonstone", type: "stone", label: "Moonstone", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:quartz", type: "stone", label: "Quartz", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:carnelian", type: "stone", label: "Carnelian", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:garnet", type: "stone", label: "Garnet", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:magnetite", type: "stone", label: "Magnetite", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:pyrite", type: "stone", label: "Pyrite", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:amethyst", type: "stone", label: "Amethyst", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:ammonite", type: "stone", label: "Ammonite", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:azurite", type: "stone", label: "Azurite", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:sodalite", type: "stone", label: "Sodalite", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:turquoise", type: "stone", label: "Turquoise", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:jet", type: "stone", label: "Jet", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:serpentine_stone", type: "stone", label: "Serpentine", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:stone:smoky_quartz", type: "stone", label: "Smoky quartz", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 23" },
  { id: "corr:incense:dragon_s_blood", type: "incense", label: "Dragon's blood", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:galbanum", type: "incense", label: "Galbanum", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:mastic", type: "incense", label: "Mastic", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:storax", type: "incense", label: "Storax", planets: ["planet:mercury"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:benzoin", type: "incense", label: "Benzoin", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:lilac", type: "incense", label: "Lilac", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:lily", type: "incense", label: "Lily", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:camphor", type: "incense", label: "Camphor", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:vanilla", type: "incense", label: "Vanilla", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:ylang_ylang", type: "incense", label: "Ylang-ylang", planets: ["planet:moon"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:black_pepper", type: "incense", label: "Black pepper", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:opoponax", type: "incense", label: "Opoponax", planets: ["planet:mars"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:copal", type: "incense", label: "Copal", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:hyssop", type: "incense", label: "Hyssop", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:juniper", type: "incense", label: "Juniper", planets: ["planet:jupiter"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:red_sandalwood", type: "incense", label: "Red sandalwood", planets: ["planet:sun"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:white_sandalwood", type: "incense", label: "White sandalwood", planets: ["planet:venus"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:pine", type: "incense", label: "Pine", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 21" },
  { id: "corr:incense:vetivert", type: "incense", label: "Vetivert", planets: ["planet:saturn"], source: "Llewellyn", citation: "Book Three, Table 21" },
];

// ─── Query helpers ───

export function correspondencesForPlanet(planetId: string, type?: CorrespondenceType): CorrespondenceEntry[] {
  return CORRESPONDENCES.filter(c =>
    c.planets.includes(planetId) && (!type || c.type === type)
  );
}

export function herbsForPlanet(planetId: string): CorrespondenceEntry[] {
  return correspondencesForPlanet(planetId, "herb");
}

export function metalsForPlanet(planetId: string): CorrespondenceEntry[] {
  return correspondencesForPlanet(planetId, "metal");
}

export function coloursForPlanet(planetId: string): CorrespondenceEntry[] {
  return correspondencesForPlanet(planetId, "colour");
}

export function stonesForPlanet(planetId: string): CorrespondenceEntry[] {
  return correspondencesForPlanet(planetId, "stone");
}

export function incensesForPlanet(planetId: string): CorrespondenceEntry[] {
  return correspondencesForPlanet(planetId, "incense");
}

