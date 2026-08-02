import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, Users2, ArrowUpRight, ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import SplitBar from "@/components/SplitBar";
import ProfitChart from "@/components/ProfitChart";
import UploadReport from "@/components/UploadReport";
import StatusBadge from "@/components/StatusBadge";
import {
  getMaster,
  getFollowersForMaster,
  dailyProfitForMaster,
  payoutsForMaster,
} from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

export default async function MasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const master = getMaster(id);
  if (!master) notFound();

  const masterFollowers = getFollowersForMaster(id);
  const dailyProfit = dailyProfitForMaster(id);
  const payouts = payoutsForMaster(id);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-text-dim">
          <Link href="/" className="hover:text-text">
            Ringkasan
          </Link>
          <ChevronRight size={12} />
          <span className="text-text">{master.name}</span>
        </div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text">{master.name}</h1>
            <p className="mt-1 text-sm text-text-dim">
              {master.broker} · #{master.accountNumber} · {master.symbol}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Profit periode ini"
            value={formatUsd(master.totalProfitUsd)}
            icon={Coins}
            accent="gold"
          />
          <StatCard
            label="Follower"
            value={`${master.totalFollowers}`}
            icon={Users2}
          />
          <StatCard
            label="Rata-rata split follower"
            value={`${Math.round(
              masterFollowers.reduce((s, f) => s + f.splitPercent, 0) / masterFollowers.length
            )}%`}
            icon={ArrowUpRight}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-2 font-display text-sm font-semibold text-text">
              Tren Profit Kumulatif — Juli 2026
            </h2>
            <ProfitChart data={dailyProfit} />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-text">
              Upload Report MT5
            </h2>
            <UploadReport masterName={master.name} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-text">
              Follower &amp; Rasio Bagi Hasil
            </h2>
            <span className="text-xs text-text-dim">{masterFollowers.length} follower</span>
          </div>
          <div className="divide-y divide-border">
            {masterFollowers.map((f) => {
              const payout = payouts.find((p) => p.followerId === f.id);
              return (
                <Link
                  key={f.id}
                  href={`/masters/${master.id}/followers/${f.id}`}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-surface-hi/50 md:grid-cols-[1.2fr_1fr_auto] md:items-center md:gap-6"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{f.name}</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="mt-0.5 text-xs text-text-dim">
                      #{f.accountNumber} · lot {f.allocatedLot}
                    </div>
                  </div>

                  <SplitBar
                    followerPercent={f.splitPercent}
                    followerUsd={payout?.followerShareUsd}
                    masterUsd={payout?.masterShareUsd}
                  />

                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    {payout && (
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold tabular text-profit">
                          {formatUsd(payout.followerShareUsd)}
                        </div>
                        <StatusBadge status={payout.status} />
                      </div>
                    )}
                    <ChevronRight size={16} className="text-text-dim" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
