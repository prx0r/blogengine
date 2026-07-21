export interface Note {
  id: string;
  title: string;
  date: string;
  body: string;
  tag: string;
  tagLabel: string;
  createdAt: string;
}

export interface TagOption {
  value: string;
  label: string;
}

export const TAGS: TagOption[] = [
  { value: "rituals/kabbalistic-cross", label: "Kabbalistic Cross" },
  { value: "rituals/lbrp", label: "LBRP" },
  { value: "rituals/scrying", label: "Scrying" },
  { value: "meditation/ajahn-lee-method-1", label: "Ajahn Lee: Method 1" },
  { value: "elements/fire", label: "Fire" },
  { value: "elements/water", label: "Water" },
  { value: "elements/air", label: "Air" },
  { value: "elements/earth", label: "Earth" },
  { value: "elements/spirit", label: "Spirit" },
  { value: "tree-of-life/kether", label: "Kether" },
  { value: "tree-of-life/chokmah", label: "Chokmah" },
  { value: "tree-of-life/binah", label: "Binah" },
  { value: "tree-of-life/chesed", label: "Chesed" },
  { value: "tree-of-life/geburah", label: "Geburah" },
  { value: "tree-of-life/tiphareth", label: "Tiphareth" },
  { value: "tree-of-life/netzach", label: "Netzach" },
  { value: "tree-of-life/hod", label: "Hod" },
  { value: "tree-of-life/yesod", label: "Yesod" },
  { value: "tree-of-life/malkuth", label: "Malkuth" },
  { value: "tree-of-life/daath", label: "Da'ath" },
];

const STORAGE_KEY = "notes-v1";
const GIST_ID_KEY = "gist-id";
const GIST_TOKEN_KEY = "gist-token";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const SEED_KEY = "notes-seeded-v1";

const SEED_NOTES: Note[] = [
  {
    id: "voidlake",
    title: "voidlake",
    date: "2026-07-03",
    body: `im thinking i picture the forest by my house, walk up to the tree with a hole in it, walk through, this takes me to the forest by the lake, i come to the clearing and sit by the cool lake which the moon is reflected in and the stars are bright. im able to hear the buzzing of crickets in the forest and the lake is clear and obsidian, i scry here using the light of the moon, the sounds of the forest morph into messengers, i open myself to be greeted by beings of the forest, lake, air and heavens. The lake reflects the subtle impressions being spoken to me and i am able to speak back using the elements.\n\n---\n\nvoid lake:\n\nWhere it'll actually break, and what to fix before, not during:\n\n"Beings of the forest, lake, air and heavens" — that's four separate categories of contact you've opened simultaneously. Don't do that on day one. Rowe's whole method is single-element-at-a-time precisely because splitting attention across four channels means you get weak, unverifiable signal from all four instead of strong signal from one. Pick water first, since it's your literal scrying surface already — let the lake speak, ignore the forest/air/heavens contacts for now even if something shows up. You can open the other three once water is reliable. This is the single most important edit to make.\n\n"The sounds of the forest morph into messengers" is doing too much unsupervised work. That's a passive auto-transform you've pre-scripted rather than something you'll actually witness happening. If you walk in expecting crickets to become messengers, you'll manufacture messengers on schedule instead of noticing whether they actually do. Better: let the crickets just be crickets unless something genuinely shifts. The unscripted version is slower and less impressive on the first try, and that's correct — scripted contact isn't contact, it's you narrating to yourself, which is the exact failure mode I flagged earlier with active imagination.\n\nNo stated way to leave. You've built the entry (tree with hole) but not the exit. Fix this now, not after a session goes sideways. Same tree, same walk back through, every time — this matters more than people think, because a clean exit is what tells your nervous system the working is actually closed, not left hanging open.\n\nNo banishing/closing action mentioned at all. You said in an earlier message you're running LBRP already — put it at both ends of this, not just as prep beforehand. Open with it before you walk to the tree, close with it after you're back out. Rowe treats this as non-negotiable specifically because it's your test instrument: a spirit that can't return your pentagram/hexagram sign, or whose form distorts under it, is your signal something's off. You lose that check entirely if you don't run it.\n\n"I am able to speak back using the elements" — vague as stated, needs to be a real technique before session one, not improvised in the moment. What does that actually mean mechanically — vibrating a name, a gesture, a word in a specific language? Decide this now. If you don't have an answer yet, the honest move is to leave this part undefined until you've had a few sessions and see what wants to happen, rather than pre-deciding a technique that doesn't come from anything.\n\n---\n\nYeah, and don't let the "cool wtf" undersell what's actually happening mechanically, because the excitement is warranted but the model needs to stay precise or it turns into wish-fulfillment fantasy fast.\n\nWhat's actually going on, no varnish:\n\nYou're not performing rituals in a separate realm that then reaches back and pokes physical reality like a hand through a curtain. That's the Hollywood version and it'll set you up for disappointment or magical thinking about causation. What's actually happening: the imaginal space is a controlled environment for training and altering the same mind that runs your physical-world behavior. LBRP done at the lake changes you the same way LBRP done in your bedroom changes you — because it's the same nervous system, same unconscious, same pattern-recognition machinery, just running in a state with less sensory noise and more direct access to symbol-level processing. The "psychic atmosphere" isn't a separate ontological layer that leaks into physical causation. It's a higher-fidelity mirror of processes that were already running in you, now made visible and workable because you've quieted everything else down.\n\nThis is exactly Rowe's own line, worth remembering here: the symbols in scrying are anchor points for things happening above ordinary conscious awareness, not separate objects with independent physical agency. "Above your usual awareness" is still you. Not external causal machinery.\n\nWhere it does influence "physical reality," concretely, no mysticism: through you. You go into that space, you do real work on some compulsive pattern or fixation, you come out changed — and then you act differently, notice different things, make different choices. That's the entire causal chain. It's not nothing — behavior change is real, and repeated enough it reshapes a life — but it's not a separate lever on the universe. If you start expecting external events to shift because you did a working, independent of anything you then do or notice differently, that's the exact point this stops being disciplined practice and turns into magical thinking, and you should catch yourself there.\n\nOn Kastrup, since we used him earlier: even his frame doesn't get you around this. If daimon-contact is genuinely another dissociated segment of mind-at-large, that still doesn't make your ritual gestures directly rearrange furniture in the physical world — it just means the "other side" you're in dialogue with might be more real than pure psychology, not that the ritual itself has physics-breaking reach. Keep those two claims separate: (1) the entity might be more real than "just projection" — plausible, live question. (2) the ritual mechanically alters external events — no, not by the acts themselves. Only (1) is on the table here.\n\nSo: yes, it's cool, correctly. It's real training in a real state with real effects — on you, your perception, your unconscious material, your capacity to hold contact with something that isn't ordinary ego-chatter. Just don't let "semi-real and can influence physical reality" quietly slide into "my ritual acts have direct causal power over external events," because that's a different and much weaker claim that this whole practice doesn't actually support.\n\n---\n\nThe edit: Everything stays the same except the pentagram tracing direction. God-names, archangel formula, Qabalistic Cross — identical in both versions. The only thing that changes is which point of the pentagram you start from.\n\nBanishing Earth pentagram: start at the lower-left point, trace up to the top point first.\nInvoking Earth pentagram: start at the top point, trace down to the lower-left point first.\n\nThat's the whole mechanical difference — reverse the direction of the first stroke, everything else (the rest of the pentagram, the god-name vibrated at each quarter, the closing) is unchanged. Text descriptions of the exact line-order are genuinely bad for learning this — get a diagram (Regardie's The Golden Dawn or Crowley's Liber O both have the standard tracings) and look at it once. Don't try to learn pentagram tracing from prose, you'll get it backwards.\n\nOrder, and this is the actual rule, not a preference:\n\nEntering: LBRP first, always, in physical space, before you even begin the walk to the tree. Banishing isn't optional prep — it clears you and the space of whatever unrelated noise/influence is already sitting there, so what you contact afterward is more likely to be signal, not static.\n\nOnce you're established at the lake (body felt, space stable) and you actually want to open to contact: that's when you run the invoking version — LIRP — to actively open the channel. Don't invoke before you're settled; you're just amplifying whatever's already loose in you.\n\nExiting: LBRP again. Always. This is the one non-negotiable part. You never leave a working invoked/open — you close every single time, no exceptions, even if the session felt incomplete or you want to "keep it going." An open, unclosed invocation is how people get genuinely destabilized by this work — racing thoughts, disturbed sleep, feeling like something's still "on." Banish before you walk back through the tree, and banish again after you're fully back in ordinary waking state, physically, not just imaginally.\n\n---\n\nim thinking i picture the forest by my house, walk up to the tree with a hole in it, walk through, this takes me to the forest by the lake, i come to the clearing and sit by the cool lake which the moon is reflected in and the stars are bright. im able to hear the buzzing of crickets in the forest and the lake is clear and obsidian, i scry here using the light of the moon, the sounds of the forest morph into messengers, i open myself to be greeted by beings of the forest, lake, air and heavens. The lake reflects the subtle impressions being spoken to me and i am able to speak back using the elements.\n\nThat's a real design, not just a mood — walk through it once, out loud, and check for the failure points before you run it for real.\n\nWhat's strong:\n\nThe tree-with-a-hole-in-it as your threshold is exactly the fixed-entry-point Rowe wants, and it's better than most people's because it's rooted in a real place near you — that's going to carry more charge than a generic imagined portal.\nElements distributed cleanly across the four directions of sense (forest=air/crickets, lake=water/scrying, moon+stars=fire/spirit, ground you're sitting on=earth) — you didn't force this, it just fell out of the imagery, which is a good sign it's coming from somewhere real rather than being constructed top-down.\n"The lake reflects subtle impressions" as your actual scrying mechanism is clean and specific — you know exactly what you're looking at and why, better than "stare into blackness and see what happens."\n\nWhere it'll actually break, and what to fix before, not during:\n\n"Beings of the forest, lake, air and heavens" — that's four separate categories of contact you've opened simultaneously. Don't do that on day one. Rowe's whole method is single-element-at-a-time precisely because splitting attention across four channels means you get weak, unverifiable signal from all four instead of strong signal from one. Pick water first, since it's your literal scrying surface already — let the lake speak, ignore the forest/air/heavens contacts for now even if something shows up. You can open the other three once water is reliable. This is the single most important edit to make.\n"The sounds of the forest morph into messengers" is doing too much unsupervised work. That's a passive auto-transform you've pre-scripted rather than something you'll actually witness happening. If you walk in expecting crickets to become messengers, you'll manufacture messengers on schedule instead of noticing whether they actually do. Better: let the crickets just be crickets unless something genuinely shifts. The unscripted version is slower and less impressive on the first try, and that's correct — scripted contact isn't contact, it's you narrating to yourself, which is the exact failure mode I flagged earlier with active imagination.\nNo stated way to leave. You've built the entry (tree with hole) but not the exit. Fix this now, not after a session goes sideways. Same tree, same walk back through, every time — this matters more than people think, because a clean exit is what tells your nervous system the working is actually closed, not left hanging open.\nNo banishing/closing action mentioned at all. You said in an earlier message you're running LBRP already — put it at both ends of this, not just as prep beforehand. Open with it before you walk to the tree, close with it after you're back out. Rowe treats this as non-negotiable specifically because it's your test instrument: a spirit that can't return your pentagram/hexagram sign, or whose form distorts under it, is your signal something's off. You lose that check entirely if you don't run it.\n"I am able to speak back using the elements" — vague as stated, needs to be a real technique before session one, not improvised in the moment. What does that actually mean mechanically — vibrating a name, a gesture, a word in a specific language? Decide this now. If you don't have an answer yet, the honest move is to leave this part undefined until you've had a few sessions and see what wants to happen, rather than pre-deciding a technique that doesn't come from anything.\n\nRun it once mentally start-to-finish including the fixed exit and the closing banishing before you sit down for the real thing. If any part of the walk-through feels like you're inventing it as you go rather than seeing it, that's the part to simplify further.`,
    tag: "rituals/scrying",
    tagLabel: "Scrying",
    createdAt: "2026-07-03T10:00:00.000Z",
  },
];

function getAll(): Note[] {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val) return JSON.parse(val);
    if (!localStorage.getItem(SEED_KEY)) {
      localStorage.setItem(SEED_KEY, "1");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTES));
      return [...SEED_NOTES];
    }
    return [];
  } catch {
    return [];
  }
}

function saveAll(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNotesByTag(tag: string): Note[] {
  return getAll()
    .filter((n) => n.tag === tag)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNote(id: string): Note | undefined {
  return getAll().find((n) => n.id === id);
}

export function getAllNotes(): Note[] {
  return getAll().sort((a, b) => b.date.localeCompare(a.date));
}

export function addNote(title: string, body: string, tag: string, tagLabel: string): Note {
  const notes = getAll();
  const note: Note = {
    id: uid(),
    title,
    date: new Date().toISOString().slice(0, 10),
    body,
    tag,
    tagLabel,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  saveAll(notes);
  return note;
}

export function deleteNote(id: string) {
  saveAll(getAll().filter((n) => n.id !== id));
}

export function getGistToken(): string {
  return localStorage.getItem(GIST_TOKEN_KEY) || "";
}

export function setGistToken(token: string) {
  localStorage.setItem(GIST_TOKEN_KEY, token);
}

export function getGistId(): string | null {
  return localStorage.getItem(GIST_ID_KEY);
}

export function setGistId(id: string) {
  localStorage.setItem(GIST_ID_KEY, id);
}

export async function syncToGist(token: string): Promise<void> {
  const all = getAll();
  const content = JSON.stringify(all, null, 2);
  const existingId = getGistId();
  const url = existingId ? `https://api.github.com/gists/${existingId}` : "https://api.github.com/gists";
  const method = existingId ? "PATCH" : "POST";
  const body: Record<string, unknown> = { description: "33s notes", files: { "notes.json": { content } } };
  if (!existingId) body.public = false;
  const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!existingId) setGistId(data.id);
}

export async function loadFromGist(token: string, gistId?: string): Promise<void> {
  const id = gistId || getGistId();
  if (!id) throw new Error("No gist ID");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/gists/${id}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  const data = await res.json();
  const content = data.files?.["notes.json"]?.content;
  if (!content) throw new Error("No notes.json in gist");
  saveAll(JSON.parse(content) as Note[]);
  if (!getGistId()) setGistId(id);
}
