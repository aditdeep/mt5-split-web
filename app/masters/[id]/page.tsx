import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProfitChart from "@/components/ProfitChart";
import UploadReport from "@/components/UploadReport";
import LiveMasterPanel from "@/components/LiveMasterPanel";
import { fetchMasterLive } from "@/lib/api";
import { dailyProfitForMaster } from "@/lib/mock-data";

export default async function MasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchMasterLive(id);
  if (!result) notFound();

  const { master, followers, payouts, live, lastSyncedAt } = result;

  // The profit trend chart isn't wired to the live API yet (see
  // DashboardController::profitTrend on the backend for the endpoint) —
  // it still reads the bundled mock series so the page has something to
  // show in demo mode. Swap this for a fetch to
  // `${API_BASE}/masters/${id}/profit-trend` once you're ready.
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text">{master.name}</h1>
            <p className="mt-1 text-sm text-text-dim">
              {master.broker} · #{master.accountNumber} · {master.symbol}
            </p>
          </div>
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

