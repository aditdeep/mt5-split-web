"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Users2, Coins, Menu, X, LogOut } from "lucide-react";
import type { Master } from "@/lib/types";
import { fetchMastersLive } from "@/lib/api";
import { getStoredUser, getToken, logout } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [masters, setMasters] = useState<Master[]>([]);
  const userName = typeof window !== "undefined" ? getStoredUser()?.name : undefined;

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    fetchMastersLive().then((res) => {
      if (res.unauthorized) {
        logout();
        router.push("/login");
        return;
      }
      setMasters(res.masters);
    });
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const NavContent = (
    <>
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
          <Coins size={17} className="text-gold" strokeWidth={2} />
        </div>
        <div>
          <div className="font-display text-sm font-semibold leading-none text-text">
            SplitDesk
          </div>
          <div className="mt-1 text-[11px] leading-none text-text-dim">MT5 Profit Sharing</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/"
              ? "bg-surface-hi text-text"
              : "text-text-dim hover:bg-surface-hi/60 hover:text-text"
          }`}
        >
          <LayoutGrid size={16} strokeWidth={1.75} />
          Ringkasan
        </Link>
      </nav>

      <div className="px-5 pb-2 pt-2 text-[11px] font-medium uppercase tracking-wider text-text-dim">
        Master Accounts
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {masters.length === 0 && (
          <p className="px-3 py-2 text-xs text-text-dim">Belum ada master account.</p>
        )}
        {masters.map((m) => {
          const active = pathname === `/masters/${m.id}` || pathname.startsWith(`/masters/${m.id}/`);
          return (
            <Link
              key={m.id}
              href={`/masters/${m.id}`}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition-colors ${
                active ? "bg-surface-hi" : "hover:bg-surface-hi/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${active ? "text-text" : "text-text-dim"}`}>
                  {m.name}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-text-dim">
                <Users2 size={11} strokeWidth={1.75} />
                {m.totalFollowers} follower · {m.broker}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-dim transition-colors hover:bg-surface-hi/60 hover:text-text"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Keluar {userName ? `(${userName})` : ""}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface/60 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15">
            <Coins size={15} className="text-gold" strokeWidth={2} />
          </div>
          <span className="font-display text-sm font-semibold text-text">SplitDesk</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hi hover:text-text"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/60 md:flex">
        {NavContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-text-dim hover:bg-surface-hi hover:text-text"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            {NavContent}
          </aside>
        </div>
      )}
    </>
  );
}
