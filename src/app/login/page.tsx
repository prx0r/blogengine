"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex flex-col gap-5 w-full max-w-xs">
        <h1 className="text-xl font-semibold text-center">Re-Rendering Atlas</h1>

        <div className="flex border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm transition-colors ${mode === "login" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm transition-colors ${mode === "signup" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            autoFocus
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="rounded bg-zinc-100 text-zinc-900 px-3 py-2 text-sm font-medium hover:bg-zinc-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
