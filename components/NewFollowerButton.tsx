"use client";

import { useEffect, useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch, getStoredUser } from "@/lib/auth";

export default function NewFollowerButton({ masterId, onCreated }: { masterId: string; onCreated?: () => void }) {
  const [canAdd, setCanAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    account_number: "",
    split_percent: "70",
    allocated_lot: "1",
    capital_usd: "",
    deposit_percent: "10",
  });

  useEffect(() => {
    const user = getStoredUser();
    setCanAdd(user?.role === "admin" || (user?.role === "master" && String(user.master_id) === masterId));
  }, [masterId]);

  if (!canAdd) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch(`/masters/${masterId}/followers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          split_percent: Number(form.split_percent),
          allocated_lot: Number(form.allocated_lot),
          capital_usd: form.capital_usd ? Number(form.capital_usd) : 0,
          deposit_percent: Number(form.deposit_percent),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal menambah follower.");
      }
      setOpen(false);
      setForm({ name: "", account_number: "", split_percent: "70", allocated_lot: "1", capital_usd: "", deposit_percent: "10" });
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah follower.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90 sm:text-sm"
      >
        <UserPlus size={15} /> Tambah Follower
      </button>

      {open && (
        <Modal title="Tambah Follower" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit}>
            <FormField label="Nama">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Budi Santoso" />
            </FormField>
            <FormField label="Nomor Akun">
              <input required className={inputClass} value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="50012345" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Split Follower (%)">
                <input required type="number" min="0" max="100" className={inputClass} value={form.split_percent} onChange={(e) => setForm({ ...form, split_percent: e.target.value })} />
              </FormField>
              <FormField label="Copy Lot">
                <input required type="number" step="0.01" min="0" className={inputClass} value={form.allocated_lot} onChange={(e) => setForm({ ...form, allocated_lot: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Modal (USD)">
                <input type="number" min="0" className={inputClass} value={form.capital_usd} onChange={(e) => setForm({ ...form, capital_usd: e.target.value })} placeholder="1000" />
              </FormField>
              <FormField label="Deposit Dimuka (%)">
                <input type="number" min="0" max="100" className={inputClass} value={form.deposit_percent} onChange={(e) => setForm({ ...form, deposit_percent: e.target.value })} />
              </FormField>
            </div>

            {error && <div className="mb-3 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Simpan
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
