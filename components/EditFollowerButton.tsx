"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch } from "@/lib/auth";
import type { Follower } from "@/lib/types";

export default function EditFollowerButton({
  masterId,
  follower,
  onUpdated,
}: {
  masterId: string;
  follower: Follower;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: follower.name,
    account_number: follower.accountNumber,
    split_percent: String(follower.splitPercent),
    allocated_lot: String(follower.allocatedLot),
    status: follower.status,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch(`/masters/${masterId}/followers/${follower.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          split_percent: Number(form.split_percent),
          allocated_lot: Number(form.allocated_lot),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal update follower.");
      }
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update follower.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hi hover:text-text"
        aria-label="Edit follower"
      >
        <Pencil size={14} />
      </button>

      {open && (
        <Modal title={`Edit ${follower.name}`} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit}>
            <FormField label="Nama">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Nomor Akun">
              <input required className={inputClass} value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Split Follower (%)">
                <input required type="number" min="0" max="100" className={inputClass} value={form.split_percent} onChange={(e) => setForm({ ...form, split_percent: e.target.value })} />
              </FormField>
              <FormField label="Copy Lot">
                <input required type="number" step="0.01" min="0" className={inputClass} value={form.allocated_lot} onChange={(e) => setForm({ ...form, allocated_lot: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "paused" })}
              >
                <option value="active">Aktif</option>
                <option value="paused">Nonaktif</option>
              </select>
            </FormField>

            {error && <div className="mb-3 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Simpan Perubahan
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
