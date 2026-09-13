"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Incorrect password.");
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020e30] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-1 font-extrabold tracking-tight">
          <span className="text-2xl text-white">LU</span>
          <span className="text-2xl text-[#31b1fb]">X</span>
          <span className="text-2xl text-white">URY</span>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/10 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
        >
          <h1 className="mb-1 text-xl font-bold text-[#0b1836]">Admin sign in</h1>
          <p className="mb-6 text-sm text-[#71809f]">Manage every page on the LUXURY website.</p>

          <label className="mb-5 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#0b1836]">Password</span>
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-[#0b1836] outline-none transition-colors focus:border-[#2365fa] focus:ring-2 focus:ring-[#2365fa]/20"
            />
          </label>

          {error && (
            <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2365fa] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(35,101,250,0.7)] transition-colors hover:bg-[#1a4fd4] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
