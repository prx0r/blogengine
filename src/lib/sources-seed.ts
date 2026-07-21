export interface SeedSource {
  url: string;
  name: string;
  kind: "rss" | "scrape";
  category: string;
}

export const seedSources: SeedSource[] = [
  { url: "https://www.pchvykov.com/blog", name: "P Chvykov", kind: "rss", category: "complexity" },
  { url: "https://thoughtforms.life/", name: "Thought Forms", kind: "rss", category: "complexity" },
  { url: "https://cscsc.notion.site/CSCSC-286d8cae0cfe813290abf9eb6acd731c", name: "CSCSC", kind: "scrape", category: "complexity" },
  { url: "https://cscsc.notion.site/Core-questions-29ad8cae0cfe80309dd3faecbf7c8d1c", name: "CSCSC Core Questions", kind: "scrape", category: "complexity" },
  { url: "https://qri.org/blog", name: "QRI", kind: "rss", category: "consciousness" },
  { url: "http://bach.ai/", name: "Bach AI", kind: "rss", category: "consciousness" },
  { url: "https://footnotes2plato.com/", name: "Footnotes 2 Plato", kind: "rss", category: "complexity" },
  { url: "https://scottaaronson.blog/", name: "Scott Aaronson", kind: "rss", category: "cogsci" },
  { url: "https://schwitzsplinters.blogspot.com/", name: "Schwitzsplinters", kind: "rss", category: "consciousness" },
  { url: "https://www.withrealityinmind.com/", name: "With Reality in Mind", kind: "scrape", category: "consciousness" },
  { url: "https://opentheory.net/", name: "Open Theory", kind: "rss", category: "consciousness" },
  { url: "https://qualiacomputing.com/", name: "Qualia Computing", kind: "rss", category: "consciousness" },
  { url: "https://meaningness.com/", name: "Meaningness", kind: "rss", category: "complexity" },
  { url: "https://gwern.net/", name: "Gwern", kind: "rss", category: "complexity" },
  { url: "https://www.theintrinsicperspective.com/", name: "The Intrinsic Perspective", kind: "rss", category: "cogsci" },
  { url: "https://pathpress.org/", name: "Path Press", kind: "scrape", category: "dhamma" },
  { url: "https://www.hillsidehermitage.org/category/blog/", name: "Hillside Hermitage", kind: "scrape", category: "dhamma" },
  { url: "https://seeingthroughthenet.net/", name: "Seeing Through the Net", kind: "scrape", category: "dhamma" },
  { url: "https://www.thetransmitter.org/", name: "The Transmitter", kind: "rss", category: "cogsci" },
];
