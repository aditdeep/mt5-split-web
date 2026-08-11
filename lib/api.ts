import type { Master, Follower, PayoutPeriod } from "./types";
import { masters as mockMasters, getFollowersForMaster, getMaster, payoutsForMaster } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. https://mt5-split-api.onrender.com/api

export const isLiveApiConfigured = Boolean(API_BASE);

type LiveMasterDetail = {
  id: number;
  name: string;
  broker: string;
  account_number: string;
  symbol: string;
  total_profit_usd: number;
  last_report_at: string | null;
  last_synced_at: string | null;
  followers: Array<{
    id: number;
    name: string;
    account_number: string;
    split_percent: string;
    allocated_lot: string;
    status: "active" | "paused";
    joined_at: string;
  }>;
};

export async function fetchMasterLive(masterId: string): Promise<{
  master: Master;
  followers: Follower[];
  payouts: PayoutPeriod[];
  live: boolean;
  lastSyncedAt: string | null;
} | null> {
  if (!API_BASE) {
    // No backend wired up yet — fall back to the bundled mock data so the
    // dashboard keeps working in demo mode.
    const master = getMaster(masterId);
    if (!master) return null;
    return {
      master,
      followers: getFollowersForMaster(masterId),
      payouts: payoutsForMaster(masterId),
      live: false,
      lastSyncedAt: null,
    };
  }

  const res = await fetch(`${API_BASE}/masters/${masterId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data: LiveMasterDetail = await res.json();

  const master: Master = {
    id: String(data.id),
    name: data.name,
    broker: data.broker,
    accountNumber: data.account_number,
    symbol: data.symbol,
    totalFollowers: data.followers.length,
    totalProfitUsd: data.total_profit_usd,
    lastReportAt: data.last_report_at ?? new Date().toISOString(),
  };

  const followers: Follower[] = data.followers.map((f) => ({
    id: String(f.id),
    masterId: String(data.id),
    name: f.name,
    accountNumber: f.account_number,
    splitPercent: Number(f.split_percent),
    allocatedLot: Number(f.allocated_lot),
    status: f.status,
    joinedAt: f.joined_at,
  }));

  return { master, followers, payouts: [], live: true, lastSyncedAt: data.last_synced_at };
}

export function getMockMasters(): Master[] {
  return mockMasters;
}

type LiveMasterSummary = {
  id: number;
  name: string;
  broker: string;
  account_number: string;
  symbol: string;
  total_followers: number;
  total_profit_usd: number;
  last_report_at: string | null;
};

export async function fetchMastersLive(): Promise<{ masters: Master[]; live: boolean }> {
  if (!API_BASE) {
    return { masters: mockMasters, live: false };
  }

  const res = await fetch(`${API_BASE}/masters`, { cache: "no-store" });
  if (!res.ok) return { masters: [], live: true };

  const data: LiveMasterSummary[] = await res.json();
  const masters: Master[] = data.map((m) => ({
    id: String(m.id),
    name: m.name,
    broker: m.broker,
    accountNumber: m.account_number,
    symbol: m.symbol,
    totalFollowers: m.total_followers,
    totalProfitUsd: m.total_profit_usd,
    lastReportAt: m.last_report_at ?? new Date().toISOString(),
  }));

  return { masters, live: true };
}
