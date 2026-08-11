"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import FormField, { inputClass } from "@/components/FormField";
import { authFetch, getStoredUser } from "@/lib/auth";

type ExistingUser = { id: number; name: string; email: string } | null;

export default function LoginAccountButton({
  role,
  targetId,
  existingUser,
  onChange,
}: {
  role: "master" | "follower";
  targetId: string;
  existingUser: ExistingUser;
  onChange?: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: existingUser?.name ?? "",
    email: existingUser?.email ?? "",
    password: "",
  });

  useEffect(() => {
    setIsAdmin(getStoredUser()?.role === "admin");
  }, []);

  useEffect(() => {
    setForm({ name: existingUser?.name ?? "", email: existingUser?.email ?? "", password: "" });
  }, [existingUser]);

  if (!isAdmin) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      if (existingUser) {
        const body: Record<string, string> = { name: form.name, email: form.email };
        if (form.password) body.password = form.password;
        res = await authFetch(`/admin/users/${existingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await authFetch("/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role,
            ...(role === "master" ? { master_id: targetId } : { follower_id: targetId }),
          }),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Gagal menyimpan akun login.");
      }
      setOpen(false);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan akun login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/admin/users/${existingUser.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Gagal menghapus akun login.");
      setOpen(false);
      setConfirmDelete(false);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun login.");
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
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
          existingUser ? "bg-profit/15 text-profit" : "bg-surface-hi text-text-dim hover:text-text"
        }`}
      >
        <KeyRound size={12} />
        {existingUser ? existingUser.email : "Buat akun login"}
      </button>

      {open && (
        <Modal title={existingUser ? "Kelola Akun Login" : "Buat Akun Login"} onClose={() => setOpen(false)}>
          {!confirmDelete ? (
            <form onSubmit={handleSubmit}>
              <FormField label="Nama">
                <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormField>
              <FormField label="Email">
                <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </FormField>
              <FormField label={existingUser ? "Password baru (kosongkan jika tidak diubah)" : "Password"}>
                <input
                  type="password"
                  required={!existingUser}
                  minLength={8}
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={existingUser ? "••••••••" : "min. 8 karakter"}
                />
              </FormField>

              {error && <div className="mb-3 rounded-lg bg-loss/10 px-3 py-2 text-xs text-loss">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Simpan
              </button>

              {existingUser && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-loss/30 px-4 py-2.5 text-sm text-loss hover:bg-loss/10"
                >
                  <Trash2 size={14} /> Hapus Akun Login
                </button>
              )}
            </form>
          ) : (
            <div>
              <p className="mb-4 text-sm text-text-dim">
                Yakin hapus akun login <span className="text-text">{existingUser?.email}</span>? User ini nggak akan bisa
                login lagi sampai dibuatkan akun baru.
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
                  Ya, Hapus
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
