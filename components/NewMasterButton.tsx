"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch, getStoredUser } from "@/lib/auth";

export default function NewMasterButton() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", broker: "", account_number: "", symbol: "XAUUSD" });

  useEffect(() => {
    setIsAdmin(getStoredUser()?.role === "admin");
  }, []);

  if (!isAdmin) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch("/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal menambah master.");
      }
      setOpen(false);
      setForm({ name: "", broker: "", account_number: "", symbol: "XAUUSD" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah master.");
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
        <Plus size={15} /> Tambah Master
      </button>

      {open && (
        <Modal title="Tambah Master Account" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit}>
            <FormField label="Nama">
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Windsor Gold Alpha"
              />
            </FormField>
            <FormField label="Broker">
              <input
                required
                className={inputClass}
                value={form.broker}
                onChange={(e) => setForm({ ...form, broker: e.target.value })}
                placeholder="Windsor"
              />
            </FormField>
            <FormField label="Nomor Akun">
              <input
                required
                className={inputClass}
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                placeholder="40021988"
              />
            </FormField>
            <FormField label="Symbol">
              <input
                className={inputClass}
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                placeholder="XAUUSD"
              />
            </FormField>

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
