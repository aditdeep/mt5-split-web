import type {
  Master,
  Follower,
  Deal,
  PayoutPeriod,
  ReportUpload,
  DailyProfitPoint,
} from "./types";

// Deterministic pseudo-random so the dashboard looks the same on every load
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const masters: Master[] = [
  {
    id: "m1",
    name: "Windsor Gold Alpha",
    broker: "Windsor",
    accountNumber: "40021988",
    symbol: "XAUUSD",
    totalFollowers: 4,
    totalProfitUsd: 18420.55,
    lastReportAt: "2026-08-01T14:20:00Z",
  },
  {
    id: "m2",
    name: "Exness Gold Prime",
    broker: "Exness",
    accountNumber: "77104521",
    symbol: "XAUUSD",
    totalFollowers: 3,
    totalProfitUsd: 9875.2,
    lastReportAt: "2026-08-01T09:05:00Z",
  },
  {
    id: "m3",
    name: "Windsor Scalper Beta",
    broker: "Windsor",
    accountNumber: "40033471",
    symbol: "XAUUSD",
    totalFollowers: 5,
    totalProfitUsd: 24310.9,
    lastReportAt: "2026-07-31T22:40:00Z",
  },
];

const followerNames = [
  "Budi Santoso",
  "Siti Rahma",
  "Andi Wijaya",
  "Dewi Lestari",
  "Rian Pratama",
  "Fajar Nugroho",
  "Maya Putri",
  "Hendra Kusuma",
  "Nadia Salsabila",
  "Yoga Prasetyo",
  "Citra Ayu",
  "Bagus Firmansyah",
];

let followerCounter = 0;
export const followers: Follower[] = masters.flatMap((master) => {
  const rand = seededRandom(master.id.length * 97 + 13);
  return Array.from({ length: master.totalFollowers }).map((_, i) => {
    const name = followerNames[followerCounter % followerNames.length];
    followerCounter += 1;
    const splitPercent = [60, 65, 70, 75, 80][Math.floor(rand() * 5)];
    return {
      id: `${master.id}-f${i + 1}`,
      masterId: master.id,
      name,
      accountNumber: `${50000000 + Math.floor(rand() * 9999999)}`,
      splitPercent,
      allocatedLot: Number((0.3 + rand() * 2.2).toFixed(2)),
      status: rand() > 0.15 ? "active" : "paused",
      joinedAt: new Date(2026, Math.floor(rand() * 6), 1 + Math.floor(rand() * 27)).toISOString(),
    };
  });
});

export const reportUploads: ReportUpload[] = masters.map((master, i) => ({
  id: `ru-${master.id}`,
  masterId: master.id,
  fileName:
    i % 2 === 0
      ? `Statement_${master.accountNumber}.html`
      : `Deals_${master.accountNumber}.csv`,
  fileType: i % 2 === 0 ? "statement_html" : "deals_csv",
  uploadedAt: master.lastReportAt,
  dealsImported: 40 + i * 17,
  periodStart: "2026-07-01T00:00:00Z",
  periodEnd: "2026-07-31T23:59:59Z",
}));

export function dealsForMaster(masterId: string): Deal[] {
  const rand = seededRandom(masterId.charCodeAt(1) * 31);
  const count = 18;
  const deals: Deal[] = [];
  for (let i = 0; i < count; i++) {
    const day = 1 + Math.floor(rand() * 27);
    const open = 2380 + rand() * 90;
    const isBuy = rand() > 0.5;
    const move = (rand() - 0.42) * 12;
    const close = isBuy ? open + move : open - move;
    const volume = Number((0.1 + rand() * 1.4).toFixed(2));
    const profit = Number(((isBuy ? close - open : open - close) * volume * 10).toFixed(2));
    deals.push({
      id: `${masterId}-d${i}`,
      masterId,
      ticket: `${900000000 + Math.floor(rand() * 9999999)}`,
      openTime: new Date(2026, 6, day, 8 + Math.floor(rand() * 10)).toISOString(),
      closeTime: new Date(2026, 6, day, 10 + Math.floor(rand() * 10)).toISOString(),
      symbol: "XAUUSD",
      type: isBuy ? "buy" : "sell",
      volume,
      openPrice: Number(open.toFixed(2)),
      closePrice: Number(close.toFixed(2)),
      profit,
      swap: Number((rand() * -3).toFixed(2)),
      commission: Number((-volume * 3.5).toFixed(2)),
    });
  }
  return deals.sort((a, b) => a.openTime.localeCompare(b.openTime));
}

export function dailyProfitForMaster(masterId: string): DailyProfitPoint[] {
  const rand = seededRandom(masterId.length * 53 + 7);
  let running = 0;
  return Array.from({ length: 30 }).map((_, i) => {
    running += (rand() - 0.38) * 650;
    return {
      date: new Date(2026, 6, i + 1).toISOString(),
      profit: Number(running.toFixed(2)),
    };
  });
}

export function payoutsForMaster(masterId: string): PayoutPeriod[] {
  const masterFollowers = followers.filter((f) => f.masterId === masterId);
  const master = masters.find((m) => m.id === masterId)!;
  const rand = seededRandom(masterId.length * 71 + 3);
  return masterFollowers.map((f) => {
    const gross = Number((master.totalProfitUsd / masterFollowers.length * (0.7 + rand() * 0.6)).toFixed(2));
    const followerShareUsd = Number((gross * (f.splitPercent / 100)).toFixed(2));
    return {
      id: `payout-${f.id}`,
      masterId,
      followerId: f.id,
      periodLabel: "Jul 2026",
      periodStart: "2026-07-01T00:00:00Z",
      periodEnd: "2026-07-31T23:59:59Z",
      grossProfitUsd: gross,
      followerSharePercent: f.splitPercent,
      followerShareUsd,
      masterShareUsd: Number((gross - followerShareUsd).toFixed(2)),
      status: rand() > 0.4 ? "paid" : "pending",
    };
  });
}

export function getMaster(id: string): Master | undefined {
  return masters.find((m) => m.id === id);
}

export function getFollowersForMaster(masterId: string): Follower[] {
  return followers.filter((f) => f.masterId === masterId);
}

export function getFollower(id: string): Follower | undefined {
  return followers.find((f) => f.id === id);
}
