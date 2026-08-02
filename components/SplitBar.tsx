import { formatPercent, formatUsd } from "@/lib/format";

type SplitBarProps = {
  followerPercent: number;
  followerUsd?: number;
  masterUsd?: number;
  compact?: boolean;
};

export default function SplitBar({
  followerPercent,
  followerUsd,
  masterUsd,
  compact = false,
}: SplitBarProps) {
  const masterPercent = 100 - followerPercent;

  return (
    <div className="w-full">
      <div
        className={`flex w-full overflow-hidden rounded-full border border-border ${
          compact ? "h-2" : "h-3"
        }`}
      >
        <div
          className="bg-gold h-full transition-all"
          style={{ width: `${masterPercent}%` }}
          title={`Master: ${masterPercent}%`}
        />
        <div
          className="bg-profit h-full transition-all"
          style={{ width: `${followerPercent}%` }}
          title={`Follower: ${followerPercent}%`}
        />
      </div>
      {!compact && (
        <div className="mt-1.5 flex items-center justify-between text-xs font-mono text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-gold" />
            Master {formatPercent(masterPercent)}
            {masterUsd !== undefined && (
              <span className="text-text-dim/70">· {formatUsd(masterUsd)}</span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            {followerUsd !== undefined && (
              <span className="text-text-dim/70">{formatUsd(followerUsd)} ·</span>
            )}
            Follower {formatPercent(followerPercent)}
            <span className="inline-block h-2 w-2 rounded-full bg-profit" />
          </span>
        </div>
      )}
    </div>
  );
}
