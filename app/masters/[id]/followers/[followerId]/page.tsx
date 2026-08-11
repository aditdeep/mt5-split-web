"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Coins, KeyRound, Copy, Check, CheckCircle2, XCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import SplitBar from "@/components/SplitBar";
import StatusBadge from "@/components/StatusBadge";
import LoginAccountButton from "@/components/LoginAccountButton";
import { authFetch, getToken, logout } from "@/lib/auth";
import { formatUsd, formatDate } from "@/lib/format";

type FollowerDetail = {
  id: number;
  name: string;
  account_number: string;
  split_percent: string;
  allocated_lot: string;
  capital_usd: string;
  deposit_percent: string;
  deposit_status: "unpaid" | "pending_confirmation" | "paid";
  deposit_required_usd: number;
  can_trade: boolean;
  gate_token: string;
  status: "active" | "paused";
  user: { id: number; name: string; email: string } | null;
};

type Payment = {
  id: number;
  amount_usd: string;
  note: string | null;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
};

export default function FollowerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; followerId: string }>();
  const { id: masterId, followerId } = params;

  const [follower, setFollower] = useState<FollowerDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notFoundState, setNotFoundState] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busyPaymentId, setBusyPaymentId] = useState<number | null>(null);

  async function load() {
    const res = await authFetch(`/masters/${masterId}/followers/${followerId}`);
    if (res.status === 401) {
      logout();
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setNotFoundState(true);
      return;
    }
    setFollower(await res.json());

    const payRes = await authFetch(`/followers/${followerId}/payments`);
    if (payRes.ok) {
      const body = await payRes.json();
      setPayments(body.payments ?? []);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId, followerId, router]);

  async function handleConfirm(paymentId: number) {
    setBusyPaymentId(paymentId);
    await authFetch(`/payments/${paymentId}/confirm`, { method: "PATCH" });
    await load();
    setBusyPaymentId(null);
  }

  async function handleReject(paymentId: number) {
    setBusyPaymentId(paymentId);
    await authFetch(`/payments/${paymentId}/reject`, { method: "PATCH" });
    await load();
    setBusyPaymentId(null);
  }

  function copyGateToken() {
    if (!follower) return;
    navigator.clipboard.writeText(follower.gate_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (notFoundState) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Follower tidak ditemukan atau lo nggak punya akses ke situ.
        </main>
      </div>
    );
  }

  if (!follower) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Memuat…
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-text-dim">
          <Link href="/" className="hover:text-text">Ringkasan</Link>
          <ChevronRight size={12} />
          <Link href={`/masters/${masterId}`} className="hover:text-text">Master</Link>
          <ChevronRight size={12} />
          <span className="text-text">{follower.name}</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-text">{follower.name}</h1>
              <StatusBadge status={follower.status} />
            </div>
            <p className="mt-1 text-sm text-text-dim">#{follower.account_number} · lot {follower.allocated_lot}</p>
          </div>
          <LoginAccountButton role="follower" targetId={String(follower.id)} existingUser={follower.user} onChange={load} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Split Follower" value={`${follower.split_percent}%`} icon={Coins} accent="profit" />
          <StatCard label="Modal (USD)" value={formatUsd(Number(follower.capital_usd))} icon={Coins} />
          <StatCard
            label="Wajib Deposit"
            value={formatUsd(follower.deposit_required_usd)}
            icon={Coins}
            accent="gold"
          />
        </div>

        <div
          className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 ${
            follower.can_trade ? "border-profit/30 bg-profit/5" : "border-loss/30 bg-loss/5"
          }`}
        >
          <div className="flex-1">
            <div className={`text-sm font-medium ${follower.can_trade ? "text-profit" : "text-loss"}`}>
              {follower.can_trade ? "Robot aktif" : "Robot nonaktif"} — status deposit: {follower.deposit_status}
            </div>
            <p className="mt-2 text-xs text-text-dim">
              Gate token buat EA <code className="rounded bg-surface-hi px-1.5 py-0.5">FollowerGate.mqh</code> follower ini:
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-hi px-3 py-1.5 font-mono text-xs text-text sm:break-all sm:whitespace-normal">
                {follower.gate_token}
              </code>
              <button onClick={copyGateToken} className="shrink-0 rounded-lg p-1.5 text-text-dim hover:bg-surface-hi hover:text-text">
                {copied ? <Check size={14} className="text-profit" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-text">Klaim Pembayaran Deposit</h2>
          </div>
          {payments.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-text-dim">Belum ada klaim pembayaran dari follower ini.</p>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="font-mono text-sm font-semibold text-text">{formatUsd(Number(p.amount_usd))}</div>
                    <div className="text-xs text-text-dim">
                      {formatDate(p.created_at)} {p.note ? `· ${p.note}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status === "confirmed" ? "paid" : p.status === "pending" ? "pending" : "rejected"} />
                    {p.status === "pending" && (
                      <>
                        <button
                          disabled={busyPaymentId === p.id}
                          onClick={() => handleConfirm(p.id)}
                          className="flex items-center gap-1 rounded-lg bg-profit/15 px-2.5 py-1.5 text-xs font-medium text-profit hover:bg-profit/25 disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} /> Konfirmasi
                        </button>
                        <button
                          disabled={busyPaymentId === p.id}
                          onClick={() => handleReject(p.id)}
                          className="flex items-center gap-1 rounded-lg bg-loss/15 px-2.5 py-1.5 text-xs font-medium text-loss hover:bg-loss/25 disabled:opacity-50"
                        >
                          <XCircle size={13} /> Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
