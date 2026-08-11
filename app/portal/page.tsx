"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Coins, AlertCircle, CheckCircle2, Clock, UploadCloud, Loader2 } from "lucide-react";
import { authFetch, getToken, logout, getStoredUser } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";
import { formatUsd, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import FormField, { inputClass } from "@/components/FormField";

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

  // Payment claim form state
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function load() {
    authFetch("/me/follower-dashboard")
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Gagal memuat data.");
        const body: DashboardData = await res.json();
        setData(body);
        setCached("portal", body);
        if (!amount) setAmount(String(body.follower.deposit_required_usd));
      })
      .catch((e) => setError(e.message));
  }

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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount_usd", amount);
      if (note) formData.append("note", note);
      if (proof) formData.append("proof", proof);

      const res = await authFetch(`/followers/${data.follower.id}/payments`, {
        method: "POST",
        body: formData, // no Content-Type — browser sets the multipart boundary itself
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal mengirim klaim pembayaran.");
      }

      setSubmitted(true);
      setNote("");
      setProof(null);
      load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim klaim pembayaran.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-sm text-loss">{error}</div>;
  }

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-text-dim">Memuat…</div>;
  }

  const { follower, master, payouts, total_owed_to_master_usd } = data;
  const showPaymentForm = follower.deposit_status !== "paid";

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
            follower.can_trade ? "border-profit/30 bg-profit/5" : "border-loss/30 bg-loss/5"
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
            <div className="mt-2 font-mono text-lg font-semibold text-profit">{follower.split_percent}%</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-dim">Status</div>
            <div className="mt-2">
              <StatusBadge status={follower.status} />
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wider text-text-dim">Belum disetor ke master</div>
            <div className="mt-2 font-mono text-lg font-semibold text-gold">{formatUsd(total_owed_to_master_usd)}</div>
          </div>
        </div>

        {/* Pintu bayar deposit dimuka */}
        {showPaymentForm && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="mb-1 font-display text-sm font-semibold text-text">
              {follower.deposit_status === "pending_confirmation" ? "Ajukan Ulang / Update Klaim" : "Konfirmasi Sudah Transfer"}
            </h2>
            <p className="mb-4 text-xs text-text-dim">
              Transfer dulu ke rekening yang dikasih admin, lalu isi form ini biar admin bisa konfirmasi.
            </p>

            {submitted && follower.deposit_status === "pending_confirmation" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold">
                <Clock size={13} /> Klaim terkirim, menunggu admin konfirmasi.
              </div>
            )}

            <form onSubmit={handleSubmitPayment}>
              <FormField label="Jumlah Transfer (USD)">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Catatan (opsional)">
                <input
                  className={inputClass}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="misal: transfer via BCA an. Budi"
                />
              </FormField>
              <FormField label="Bukti Transfer (opsional, gambar)">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-text-dim hover:border-gold/40">
                  <UploadCloud size={16} />
                  {proof ? proof.name : "Pilih file / foto bukti transfer"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                  />
                </label>
              </FormField>

              {submitError && <div className="mb-3 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{submitError}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Kirim Klaim Pembayaran
              </button>
            </form>
          </div>
        )}

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
      </div>
    </div>
  );
}
