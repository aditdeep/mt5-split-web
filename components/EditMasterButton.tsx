"use client";

import { useEffect, useState } from "react";
import { Pencil, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch, getStoredUser } from "@/lib/auth";
import type { Master } from "@/lib/types";

export default function EditMasterButton({
  master,
  onUpdated,
  onDeleted,
}: {
  master: Master;
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/masters/${master.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Gagal menghapus master.");
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus master.");
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
          {!confirmDelete ? (
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
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Simpan Perubahan
              </button>

              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-loss/30 px-4 py-2.5 text-sm text-loss hover:bg-loss/10"
              >
                <Trash2 size={14} /> Hapus Master Account
              </button>
            </form>
          ) : (
            <div>
              <p className="mb-4 text-sm text-text-dim">
                Yakin hapus <span className="text-text">{master.name}</span>? Semua follower, deal, dan riwayat
                payout di bawah master ini juga akan ikut terhapus permanen.
              </p>
              {error && <div className="mb-3 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{error}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-text-dim hover:text-text"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-loss px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Ya, Hapus Permanen
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
