"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Coins, Users2, ArrowUpRight, ChevronRight, Radio } from "lucide-react";
import StatCard from "@/components/StatCard";
import SplitBar from "@/components/SplitBar";
import StatusBadge from "@/components/StatusBadge";
import { fetchMasterLive } from "@/lib/api";
import { formatUsd } from "@/lib/format";
import type { Master, Follower, PayoutPeriod } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

type Props = {
  masterId: string;
  initialMaster: Master;
  initialFollowers: Follower[];
  initialPayouts: PayoutPeriod[];
  initialLive: boolean;
  initialLastSyncedAt: string | null;
};

export default function LiveMasterPanel({
  masterId,
  initialMaster,
  initialFollowers,
  initialPayouts,
  initialLive,
  initialLastSyncedAt,
}: Props) {
  const [master, setMaster] = useState(initialMaster);
  const [followers, setFollowers] = useState(initialFollowers);
  const [payouts] = useState(initialPayouts);
  const [lastSyncedAt, setLastSyncedAt] = useState(initialLastSyncedAt);
  const [secondsSincePoll, setSecondsSincePoll] = useState(0);
  const pollingRef = useRef(false);

  // Poll the backend on an interval. If NEXT_PUBLIC_API_URL isn't configured
  // yet (demo/mock mode), fetchMasterLive returns `live: false` and this is
  // effectively a no-op refresh of the same mock data.
  useEffect(() => {
    if (!initialLive) return; // don't poll in mock/demo mode

    const interval = setInterval(async () => {
      if (pollingRef.current) return; // skip overlapping requests
      pollingRef.current = true;
      try {
        const result = await fetchMasterLive(masterId);
        if (result) {
          setMaster(result.master);
          setFollowers(result.followers);
          setLastSyncedAt(result.lastSyncedAt);
          setSecondsSincePoll(0);
        }
      } catch {
        // Network hiccup — just try again next tick, don't crash the panel.
      } finally {
        pollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [masterId, initialLive]);

  // Local "X detik lalu" ticker, independent of the poll itself.
  useEffect(() => {
    const tick = setInterval(() => setSecondsSincePoll((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [lastSyncedAt]);

  const avgSplit = followers.length
    ? Math.round(followers.reduce((s, f) => s + f.splitPercent, 0) / followers.length)
    : 0;

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        {initialLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-profit/15 px-2.5 py-1 text-[11px] font-medium text-profit">
            <Radio size={11} className="animate-pulse" strokeWidth={2} />
            Live · sync {formatSecondsAgo(secondsSincePoll)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-text-dim/15 px-2.5 py-1 text-[11px] font-medium text-text-dim">
            Mode demo (data contoh) — set NEXT_PUBLIC_API_URL untuk data live
          </span>
        )}
        {lastSyncedAt && (
          <span className="text-[11px] text-text-dim">
            Deal terakhir masuk: {new Date(lastSyncedAt).toLocaleTimeString("id-ID")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Profit periode ini"
          value={formatUsd(master.totalProfitUsd)}
          icon={Coins}
          accent="gold"
        />
        <StatCard label="Follower" value={`${followers.length}`} icon={Users2} />
        <StatCard label="Rata-rata split follower" value={`${avgSplit}%`} icon={ArrowUpRight} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-text">
            Follower &amp; Rasio Bagi Hasil
          </h2>
          <span className="text-xs text-text-dim">{followers.length} follower</span>
        </div>
        <div className="divide-y divide-border">
          {followers.map((f) => {
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
    </>
  );
}

function formatSecondsAgo(seconds: number): string {
  if (seconds < 5) return "barusan";
  if (seconds < 60) return `${seconds}d lalu`;
  return `${Math.floor(seconds / 60)}m lalu`;
}
