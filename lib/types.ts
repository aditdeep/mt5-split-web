export type Master = {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  symbol: string; // primary instrument, e.g. XAUUSD
  totalFollowers: number;
  totalProfitUsd: number; // period-to-date closed profit
  lastReportAt: string; // ISO date
  loginUser?: { id: number; name: string; email: string } | null;
};

export type Follower = {
  id: string;
  masterId: string;
  name: string;
  accountNumber: string;
  splitPercent: number; // percent that goes to the follower (master gets 100 - this)
  allocatedLot: number; // relative lot sizing / copy ratio
  status: "active" | "paused";
  joinedAt: string;
  loginUser?: { id: number; name: string; email: string } | null;
};

export type Deal = {
  id: string;
  masterId: string;
  ticket: string;
  openTime: string;
  closeTime: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  swap: number;
  commission: number;
};

export type PayoutPeriod = {
  id: string;
  masterId: string;
  followerId: string;
  periodLabel: string; // e.g. "Jul 2026"
  periodStart: string;
  periodEnd: string;
  grossProfitUsd: number;
  followerSharePercent: number;
  followerShareUsd: number;
  masterShareUsd: number;
  status: "pending" | "paid";
};

export type ReportUpload = {
  id: string;
  masterId: string;
  fileName: string;
  fileType: "statement_html" | "deals_csv";
  uploadedAt: string;
  dealsImported: number;
  periodStart: string;
  periodEnd: string;
};

export type DailyProfitPoint = {
  date: string;
  profit: number;
};
