"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Coins, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { authFetch, getToken, logout, getStoredUser } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";
import { formatUsd, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

type PayoutRow = {
  id: number;
  period_label: string;
  period_start: string;
  gross_profit_usd: string;
  follower_share_percent: string;
  follower_share_usd: string;
  master_share_usd: string;
  status: "pending" | "paid";
};

type DashboardData = {
  follower: {
    id: number;
    name: string;
    account_number: string;
    split_percent: string;
    status: string;
    capital_usd: string;
    deposit_percent: string;
    deposit_required_usd: number;
    deposit_status: "unpaid" | "pending_confirmation" | "paid";
    can_trade: boolean;
  };
  master: { id: number; name: string; broker: string };
  payouts: PayoutRow[];
  total_owed_to_master_usd: number;
};

export default function FollowerPortalPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(() => getCached<DashboardData>("portal"));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    const user = getStoredUser();
    if (user && user.role !== "follower") {
      router.push("/");
      return;
    }

    authFetch("/me/follower-dashboard")
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Gagal memuat data.");
        const body = await res.json();
        setData(body);
        setCached("portal", body);
      })
      .catch((e) => setError(e.message));
  }, [router]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-sm text-loss">{error}</div>;
  }

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-text-dim">Memuat…</div>;
  }

  const { follower, master, payouts, total_owed_to_master_usd } = data;

  return (
    <div className="min-h-screen bg-bg px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold text-text">{follower.name}</h1>
            <p className="text-xs text-text-dim">
              Follower {master.name} · {master.broker} · #{follower.account_number}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-text-dim hover:text-text"
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>

        {/* Deposit / kill-switch status */}
        <div
          className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 ${
            follower.can_trade
              ? "border-profit/30 bg-profit/5"
              : "border-loss/30 bg-loss/5"
          }`}
        >
          {follower.can_trade ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-profit" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-loss" />
          )}
          <div>
            <div className={`text-sm font-medium ${follower.can_trade ? "text-profit" : "text-loss"}`}>
              {follower.can_trade ? "Robot aktif — deposit lunas" : "Robot nonaktif"}
            </div>
            <p className="mt-0.5 text-xs text-text-dim">
              {follower.deposit_status === "unpaid" &&
                `Deposit dimuka belum dibayar. Wajib bayar ${formatUsd(follower.deposit_required_usd)} (${follower.deposit_percent}% dari modal ${formatUsd(Number(follower.capital_usd))}) sebelum robot bisa entry.`}
              {follower.deposit_status === "pending_confirmation" &&
                "Bukti transfer sudah dikirim, menunggu konfirmasi admin."}
              {follower.deposit_status === "paid" && "Deposit sudah dikonfirmasi admin."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-dim">Split lo</div>
            <div className="mt-2 font-mono text-lg font-semibold text-profit">
              {follower.split_percent}%
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-dim">Status</div>
            <div className="mt-2">
              <StatusBadge status={follower.status} />
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wider text-text-dim">
              Belum disetor ke master
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-gold">
              {formatUsd(total_owed_to_master_usd)}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-text">Riwayat Bagi Hasil</h2>
          </div>
          {payouts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-dim">Belum ada data periode.</p>
          ) : (
            <div className="divide-y divide-border">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm text-text">{p.period_label}</div>
                    <div className="text-xs text-text-dim">{formatDate(p.period_start)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold tabular text-profit">
                      {formatUsd(Number(p.follower_share_usd))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-dim">
                      <Clock size={10} /> Setor: {formatUsd(Number(p.master_share_usd))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!follower.can_trade && follower.deposit_status === "unpaid" && (
          <p className="mt-4 text-center text-xs text-text-dim">
            Sudah transfer? Kirim bukti ke admin lewat channel biasa buat dikonfirmasi.
          </p>
        )}
      </div>
    </div>
  );
}
