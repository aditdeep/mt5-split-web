"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, Users2, TrendingUp, ArrowUpRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import NewMasterButton from "@/components/NewMasterButton";
import { fetchMastersLive } from "@/lib/api";
import { getToken, logout } from "@/lib/auth";
import { formatUsd, formatDateTime } from "@/lib/format";
import type { Master } from "@/lib/types";

export default function OverviewPage() {
  const router = useRouter();
  const [masters, setMasters] = useState<Master[] | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    fetchMastersLive().then((res) => {
      if (res.unauthorized) {
        logout();
        router.push("/login");
        return;
      }
      setMasters(res.masters);
      setLive(res.live);
    });
  }, [router]);

  if (masters === null) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Memuat…
        </main>
      </div>
    );
  }

  const totalProfit = masters.reduce((sum, m) => sum + m.totalProfitUsd, 0);
  const totalFollowers = masters.reduce((sum, m) => sum + m.totalFollowers, 0);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 sm:mb-8">
          {!live && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-text-dim/15 px-2.5 py-1 text-[11px] font-medium text-text-dim">
              Mode demo (data contoh) — set NEXT_PUBLIC_API_URL untuk data live
            </span>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-text">
                Ringkasan Bagi Hasil
              </h1>
              <p className="mt-1 text-sm text-text-dim">
                Profit closed trade dari semua master account.
              </p>
            </div>
            <NewMasterButton onCreated={() => fetchMastersLive().then((r) => setMasters(r.masters))} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Profit (semua master)"
            value={formatUsd(totalProfit)}
            icon={Coins}
            accent="gold"
          />
          <StatCard label="Total Follower" value={`${totalFollowers}`} icon={Users2} />
          <StatCard label="Master Account" value={`${masters.length}`} icon={TrendingUp} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-display text-base font-semibold text-text">
            Master Accounts
          </h2>
          {masters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-text-dim">
              Belum ada master account. Klik &quot;Tambah Master&quot; di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {masters.map((m) => (
                <Link
                  key={m.id}
                  href={`/masters/${m.id}`}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-sm font-semibold text-text">
                        {m.name}
                      </div>
                      <div className="mt-0.5 text-xs text-text-dim">
                        {m.broker} · #{m.accountNumber} · {m.symbol}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-text-dim transition-colors group-hover:text-gold"
                    />
                  </div>

                  <div className="mt-4 font-mono text-xl font-semibold tabular text-profit">
                    {formatUsd(m.totalProfitUsd)}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-text-dim">
                    <span className="flex items-center gap-1.5">
                      <Users2 size={12} strokeWidth={1.75} />
                      {m.totalFollowers} follower
                    </span>
                    <span>Update {formatDateTime(m.lastReportAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
