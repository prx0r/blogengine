"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { days } from "@/lib/diary";
import { ELEMENTS, VISIBLE_ELEMENTS } from "@/lib/data";
import { tapes } from "@/lib/gateway";
import { useState, useEffect } from "react";
import { getNotesByTag } from "@/lib/journal";

function NoteLink({ id, title, date, onClick }: { id: string; title: string; date: string; onClick: () => void }) {
  const pathname = usePathname();
  const active = pathname === `/journal?id=${id}` || pathname === `/journal?id=${encodeURIComponent(id)}`;
  return (
    <Link
      href={`/journal?id=${id}`}
      onClick={onClick}
      className={`block text-xs transition-colors pl-8 truncate ${
        active ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {title} <span className="text-zinc-700">{date}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [personalOpen, setPersonalOpen] = useState(true);
  const [elementsOpen, setElementsOpen] = useState(true);
  const [ritualsOpen, setRitualsOpen] = useState(true);
  const [meditationOpen, setMeditationOpen] = useState(true);
  const [gatewayOpen, setGatewayOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Record<string, { id: string; title: string; date: string }[]>>({});
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setCurrentUser({ username: data.displayName || data.email });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    const grouped: Record<string, { id: string; title: string; date: string }[]> = {};
    for (const tag of ["rituals/kabbalistic-cross", "rituals/lbrp", "rituals/scrying", "meditation/ajahn-lee-method-1", "elements/fire", "elements/water", "elements/air", "elements/earth", "elements/spirit"]) {
      const ns = getNotesByTag(tag);
      if (ns.length > 0) {
        grouped[tag] = ns.map((n) => ({ id: n.id, title: n.title, date: n.date }));
      }
    }
    setNotes(grouped);
  }, [pathname]);

  if (pathname === "/login") return null;

  const linkClass = (href: string) =>
    `block text-sm transition-colors ${pathname === href ? "text-zinc-100 font-medium" : "text-zinc-500 hover:text-zinc-300"}`;

  const noteClick = () => setSidebarOpen(false);

  function Section({ label, open, toggle, children }: { label: string; open: boolean; toggle: () => void; children: React.ReactNode }) {
    return (
      <div className="mt-6">
        <button onClick={toggle} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors w-full text-left">
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          {label}
        </button>
        {open && <div className="mt-2 flex flex-col gap-0.5">{children}</div>}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-200 md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {sidebarOpen ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          )}
        </svg>
      </button>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-56 shrink-0 border-r border-zinc-800 bg-zinc-900/95 backdrop-blur-lg flex flex-col py-8 px-4 transition-transform duration-300 md:sticky md:translate-x-0 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/" className="mb-8 block" onClick={() => setSidebarOpen(false)}>
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`} alt="" className="h-8" />
        </Link>

        <nav className="flex flex-col gap-1">
          <Link href="/observatory" className={linkClass("/observatory")} onClick={() => setSidebarOpen(false)}>Observatory</Link>
          <Link href="/" className={linkClass("/")} onClick={() => setSidebarOpen(false)}>Feed</Link>
          <Link href="/sources" className={linkClass("/sources")} onClick={() => setSidebarOpen(false)}>Sources</Link>
          <Link href="/essays" className={linkClass("/essays")} onClick={() => setSidebarOpen(false)}>Essays</Link>
          <Link href="/glossary" className={linkClass("/glossary")} onClick={() => setSidebarOpen(false)}>Glossary</Link>
          <Link href="/art" className={linkClass("/art")} onClick={() => setSidebarOpen(false)}>Art</Link>
          <Link href="/books" className={linkClass("/books")} onClick={() => setSidebarOpen(false)}>Books</Link>
          <Link href="/audio" className={linkClass("/audio")} onClick={() => setSidebarOpen(false)}>Audio</Link>
          <Link href="/daimon" className={linkClass("/daimon")} onClick={() => setSidebarOpen(false)}>Daimon</Link>
          <Link href="/journal" className={linkClass("/journal")} onClick={() => setSidebarOpen(false)}>Journal</Link>
          <Link href="/atlas" className={linkClass("/atlas")} onClick={() => setSidebarOpen(false)}>Atlas</Link>
          <Link href="/chat" className={linkClass("/chat")} onClick={() => setSidebarOpen(false)}>Chat</Link>
          <Link href="/tree-of-life" className={linkClass("/tree-of-life")} onClick={() => setSidebarOpen(false)}>Tree of Life</Link>
          <Link href="/birth-chart" className={linkClass("/birth-chart")} onClick={() => setSidebarOpen(false)}>Birth Chart</Link>
          <Link href="/spells" className={linkClass("/spells")} onClick={() => setSidebarOpen(false)}>Spells</Link>
          <Link href="/settings" className={linkClass("/settings")} onClick={() => setSidebarOpen(false)}>Settings</Link>
        </nav>

        <Section label="Elements" open={elementsOpen} toggle={() => setElementsOpen(!elementsOpen)}>
          {VISIBLE_ELEMENTS.map((id) => {
            const el = ELEMENTS[id];
            const active = pathname === `/elements/${id}` || (pathname === "/elements" && id === "fire");
            return (
              <div key={id}>
                <Link href={`/elements/${id}`} onClick={noteClick} className={`flex items-center gap-2 text-sm transition-colors pl-4 ${active ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"}`}>
                  <span className="text-base">{el.symbol}</span>
                  {el.name}
                </Link>
                {(notes[`elements/${id}`] || []).map((n) => (
                  <NoteLink key={n.id} {...n} onClick={noteClick} />
                ))}
              </div>
            );
          })}
          <div>
            <Link href="/elements/spirit" onClick={noteClick} className={`flex items-center gap-2 text-sm transition-colors pl-4 ${pathname === "/elements/spirit" ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"}`}>
              <span className="text-base">{ELEMENTS.spirit.symbol}</span>
              Spirit
            </Link>
            {(notes["elements/spirit"] || []).map((n) => (
              <NoteLink key={n.id} {...n} onClick={noteClick} />
            ))}
          </div>
        </Section>

        <Section label="Rituals" open={ritualsOpen} toggle={() => setRitualsOpen(!ritualsOpen)}>
          {[
            { href: "/rituals/kabbalistic-cross", sym: "✝", label: "Kabbalistic Cross", tag: "rituals/kabbalistic-cross" },
            { href: "/rituals/lbrp", sym: "✡", label: "LBRP", tag: "rituals/lbrp" },
            { href: "/rituals/scrying", sym: "🔮", label: "Scrying", tag: "rituals/scrying" },
          ].map(({ href, sym, label, tag }) => (
            <div key={tag}>
              <Link href={href} onClick={noteClick} className={`flex items-center gap-2 text-sm transition-colors pl-4 ${pathname === href ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"}`}>
                <span className="text-xs">{sym}</span>
                {label}
              </Link>
              {(notes[tag] || []).map((n) => (
                <NoteLink key={n.id} {...n} onClick={noteClick} />
              ))}
            </div>
          ))}
        </Section>

        <Section label="Gateway Tapes" open={gatewayOpen} toggle={() => setGatewayOpen(!gatewayOpen)}>
          {tapes.map((tape) => (
            <Link
              key={tape.slug}
              href={`/gateway/${tape.slug}`}
              onClick={noteClick}
              className={`block text-sm transition-colors pl-4 ${
                pathname === `/gateway/${tape.slug}`
                  ? "text-zinc-100 font-medium"
                  : "text-zinc-600 hover:text-zinc-300"
              }`}
            >
              {tape.title}
            </Link>
          ))}
        </Section>

        <Section label="Meditation" open={meditationOpen} toggle={() => setMeditationOpen(!meditationOpen)}>
          <div>
            <Link href="/meditation/ajahn-lee-method-1" onClick={noteClick} className={`flex items-center gap-2 text-sm transition-colors pl-4 ${pathname === "/meditation/ajahn-lee-method-1" ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"}`}>
              <span className="text-xs">🧘</span>
              Ajahn Lee: Method 1
            </Link>
            {(notes["meditation/ajahn-lee-method-1"] || []).map((n) => (
              <NoteLink key={n.id} {...n} onClick={noteClick} />
            ))}
          </div>
        </Section>

        <Section label="Personal" open={personalOpen} toggle={() => setPersonalOpen(!personalOpen)}>
          {days.map((day) => (
            <Link key={day.slug} href={`/personal/${day.slug}`} onClick={noteClick}
              className={`block text-sm transition-colors pl-4 ${pathname === `/personal/${day.slug}` ? "text-zinc-100 font-medium" : "text-zinc-600 hover:text-zinc-300"}`}>
              {day.title}
            </Link>
          ))}
        </Section>

        {currentUser && (
          <div className="mt-auto pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 truncate">{currentUser.username}</span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setCurrentUser(null);
                  window.location.href = "/login";
                }}
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                logout
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
