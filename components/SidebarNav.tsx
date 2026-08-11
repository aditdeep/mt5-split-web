"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users2, Coins } from "lucide-react";
import type { Master } from "@/lib/types";

export default function SidebarNav({ masters }: { masters: Master[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/60">
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
    </aside>
  );
}
