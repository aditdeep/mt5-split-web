const styles: Record<string, string> = {
  active: "bg-profit/15 text-profit",
  paused: "bg-text-dim/15 text-text-dim",
  paid: "bg-profit/15 text-profit",
  pending: "bg-gold/15 text-gold",
};

const labels: Record<string, string> = {
  active: "Aktif",
  paused: "Nonaktif",
  paid: "Terbayar",
  pending: "Tertunda",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ?? "bg-surface-hi text-text-dim"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
