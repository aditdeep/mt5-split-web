import Link from "next/link";
import { Coins, Users2, TrendingUp, ArrowUpRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { masters, followers } from "@/lib/mock-data";
import { formatUsd, formatDateTime } from "@/lib/format";

export default function OverviewPage() {
  const totalProfit = masters.reduce((sum, m) => sum + m.totalProfitUsd, 0);
  const totalFollowers = followers.length;
  const activeFollowers = followers.filter((f) => f.status === "active").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text">
              Ringkasan Bagi Hasil
            </h1>
            <p className="mt-1 text-sm text-text-dim">
              Profit closed trade dari semua master account, periode Juli 2026.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Profit (semua master)"
            value={formatUsd(totalProfit)}
            icon={Coins}
            accent="gold"
            trend={{ value: "12.4% vs bulan lalu", positive: true }}
          />
          <StatCard
            label="Follower Aktif"
            value={`${activeFollowers} / ${totalFollowers}`}
            icon={Users2}
          />
          <StatCard
            label="Master Account"
            value={`${masters.length}`}
            icon={TrendingUp}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-display text-base font-semibold text-text">
            Master Accounts
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
        </div>
      </main>
    </div>
  );
}
