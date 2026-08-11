"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProfitChart from "@/components/ProfitChart";
import UploadReport from "@/components/UploadReport";
import LiveMasterPanel from "@/components/LiveMasterPanel";
import EditMasterButton from "@/components/EditMasterButton";
import { fetchMasterLive } from "@/lib/api";
import { getToken, logout } from "@/lib/auth";
import { dailyProfitForMaster } from "@/lib/mock-data";
import type { Master, Follower, PayoutPeriod } from "@/lib/types";

export default function MasterDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<{
    master: Master;
    followers: Follower[];
    payouts: PayoutPeriod[];
    live: boolean;
    lastSyncedAt: string | null;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  function load() {
    fetchMasterLive(id).then((result) => {
      if (!result) {
        setNotFound(true);
        return;
      }
      if (result.unauthorized) {
        logout();
        router.push("/login");
        return;
      }
      setData(result);
    });
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Master tidak ditemukan atau lo nggak punya akses ke situ.
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Memuat…
        </main>
      </div>
    );
  }

  const { master, followers, payouts, live, lastSyncedAt } = data;
  const dailyProfit = dailyProfitForMaster(id);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-text-dim">
          <Link href="/" className="hover:text-text">
            Ringkasan
          </Link>
          <ChevronRight size={12} />
          <span className="text-text">{master.name}</span>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text">{master.name}</h1>
            <p className="mt-1 text-sm text-text-dim">
              {master.broker} · #{master.accountNumber} · {master.symbol}
            </p>
          </div>
          <EditMasterButton master={master} onUpdated={load} />
        </div>

        <LiveMasterPanel
          masterId={id}
          initialMaster={master}
          initialFollowers={followers}
          initialPayouts={payouts}
          initialLive={live}
          initialLastSyncedAt={lastSyncedAt}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-2 font-display text-sm font-semibold text-text">
              Tren Profit Kumulatif
            </h2>
            <ProfitChart data={dailyProfit} />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-text">
              Upload Report MT5 (resync historis)
            </h2>
            <UploadReport masterName={master.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
