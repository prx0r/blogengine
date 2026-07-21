"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; displayName: string } | null>(null);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setUser(d); })
      .catch(() => {});
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setError("");
    if (newPw.length < 4) { setError("New password must be at least 4 characters"); return; }
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) { setMsg("Password changed"); setCurPw(""); setNewPw(""); }
      else { setError(data.error || "Failed"); }
    } catch { setError("Network error"); }
  }

  async function exportData() {
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "atlas-data.json"; a.click();
      URL.revokeObjectURL(url);
      setMsg("Data exported");
    } catch { setError("Export failed"); }
  }

  async function deleteAccount() {
    if (!confirm("Delete your entire account? This cannot be undone.")) return;
    if (!confirm("Are you sure? All your journal entries, chat history, and profile will be permanently deleted.")) return;
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST", credentials: "include",
      });
      if (res.ok) window.location.href = "/login";
      else { const d = await res.json(); setError(d.error || "Delete failed"); }
    } catch { setError("Network error"); }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">&larr; Feed</Link>
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      {!user ? (
        <p className="text-sm text-zinc-500">Not logged in. <Link href="/login" className="text-zinc-300 underline">Log in</Link></p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-zinc-300 mb-1">Account</h2>
            <p className="text-sm text-zinc-500 mb-4">{user.email || user.displayName}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-3 max-w-xs">
              <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="Current password"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500" autoComplete="current-password" />
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500" autoComplete="new-password" />
              {error && <p className="text-sm text-red-400">{error}</p>}
              {msg && <p className="text-sm text-green-400">{msg}</p>}
              <button type="submit" disabled={!curPw || !newPw}
                className="rounded bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-300 disabled:opacity-50 transition-colors">Change</button>
            </form>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Data</h2>
            <div className="flex gap-2">
              <button onClick={exportData} className="rounded border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 transition-colors">Export My Data</button>
              <button onClick={deleteAccount} className="rounded border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm text-red-400 hover:border-red-700 transition-colors">Delete Account</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
