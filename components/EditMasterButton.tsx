"use client";

import { useEffect, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch, getStoredUser } from "@/lib/auth";
import type { Master } from "@/lib/types";

export default function EditMasterButton({ master, onUpdated }: { master: Master; onUpdated?: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: master.name,
    broker: master.broker,
    account_number: master.accountNumber,
    symbol: master.symbol,
  });

  useEffect(() => {
    setIsAdmin(getStoredUser()?.role === "admin");
  }, []);

  if (!isAdmin) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch(`/masters/${master.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal update master.");
      }
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update master.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-text-dim hover:text-text sm:text-sm"
      >
        <Pencil size={14} /> Edit
      </button>

      {open && (
        <Modal title="Edit Master Account" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit}>
            <FormField label="Nama">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Broker">
              <input required className={inputClass} value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} />
            </FormField>
            <FormField label="Nomor Akun">
              <input required className={inputClass} value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
            </FormField>
            <FormField label="Symbol">
              <input className={inputClass} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
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
