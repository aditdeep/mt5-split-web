"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2 } from "lucide-react";
import { login, homeRouteForRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(homeRouteForRole(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15">
            <Coins size={24} className="text-gold" strokeWidth={2} />
          </div>
          <h1 className="font-display text-xl font-semibold text-text">SplitDesk</h1>
          <p className="mt-1 text-sm text-text-dim">Masuk sesuai peran — admin, master, atau follower</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <label className="mb-1.5 block text-xs font-medium text-text-dim">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border bg-surface-hi px-3 py-2.5 text-sm text-text outline-none focus:border-gold/50"
            placeholder="nama@email.com"
          />

          <label className="mb-1.5 block text-xs font-medium text-text-dim">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-border bg-surface-hi px-3 py-2.5 text-sm text-text outline-none focus:border-gold/50"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Masuk
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-text-dim">
          Belum punya akun? Hubungi admin — pendaftaran manual lewat dashboard.
        </p>
      </div>
    </div>
  );
}
