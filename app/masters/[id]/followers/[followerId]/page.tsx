import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Coins } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import SplitBar from "@/components/SplitBar";
import StatusBadge from "@/components/StatusBadge";
import {
  getMaster,
  getFollower,
  payoutsForMaster,
  dealsForMaster,
} from "@/lib/mock-data";
import { formatUsd, formatDate } from "@/lib/format";

export default async function FollowerDetailPage({
  params,
}: {
  params: Promise<{ id: string; followerId: string }>;
}) {
  const { id, followerId } = await params;
  const master = getMaster(id);
  const follower = getFollower(followerId);
  if (!master || !follower || follower.masterId !== master.id) notFound();

  const payout = payoutsForMaster(id).find((p) => p.followerId === followerId);
  const deals = dealsForMaster(id).slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-text-dim">
          <Link href="/" className="hover:text-text">
            Ringkasan
          </Link>
          <ChevronRight size={12} />
          <Link href={`/masters/${master.id}`} className="hover:text-text">
            {master.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-text">{follower.name}</span>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-text">{follower.name}</h1>
              <StatusBadge status={follower.status} />
            </div>
            <p className="mt-1 text-sm text-text-dim">
              #{follower.accountNumber} · copy lot {follower.allocatedLot} · gabung{" "}
              {formatDate(follower.joinedAt)}
            </p>
          </div>
        </div>

        {payout && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Gross profit (periode)"
                value={formatUsd(payout.grossProfitUsd)}
                icon={Coins}
              />
              <StatCard
                label="Bagian Follower"
                value={formatUsd(payout.followerShareUsd)}
                icon={Coins}
                accent="profit"
              />
              <StatCard
                label="Bagian Master"
                value={formatUsd(payout.masterShareUsd)}
                icon={Coins}
                accent="gold"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-text">
                  Rasio Bagi Hasil — {payout.periodLabel}
                </h2>
                <StatusBadge status={payout.status} />
              </div>
              <SplitBar
                followerPercent={payout.followerSharePercent}
                followerUsd={payout.followerShareUsd}
                masterUsd={payout.masterShareUsd}
              />
            </div>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-text">
              Riwayat Deal Master (10 terakhir)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-dim">
                  <th className="px-5 py-3 font-medium">Ticket</th>
                  <th className="px-5 py-3 font-medium">Tipe</th>
                  <th className="px-5 py-3 font-medium">Volume</th>
                  <th className="px-5 py-3 font-medium">Open</th>
                  <th className="px-5 py-3 font-medium">Close</th>
                  <th className="px-5 py-3 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono tabular">
                {deals.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-3 text-text-dim">#{d.ticket}</td>
                    <td className="px-5 py-3 uppercase text-text">{d.type}</td>
                    <td className="px-5 py-3 text-text">{d.volume}</td>
                    <td className="px-5 py-3 text-text-dim">{d.openPrice}</td>
                    <td className="px-5 py-3 text-text-dim">{d.closePrice}</td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${
                        d.profit >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatUsd(d.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
