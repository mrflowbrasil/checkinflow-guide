import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

interface Props {
  /** Total slots for the launch batch. */
  total?: number;
  /** Initial remaining count when the page loads. */
  initialRemaining?: number;
  /** Interval in ms between simulated slot decrements. Default 2m47s. */
  decrementIntervalMs?: number;
  /** Minimum remaining floor to avoid ever hitting 0 on-screen. */
  minRemaining?: number;
  className?: string;
}

/**
 * Live-decreasing scarcity indicator.
 * Starts at `initialRemaining` and drops by 1 every `decrementIntervalMs`
 * while the lead is on the page — mimicking real-time sell-through.
 */
export default function SpotsRemaining({
  total = 100,
  initialRemaining = 57,
  decrementIntervalMs = 167_000, // 2m47s
  minRemaining = 3,
  className,
}: Props) {
  const [remaining, setRemaining] = useState<number>(initialRemaining);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > minRemaining ? r - 1 : r));
    }, decrementIntervalMs);
    return () => clearInterval(id);
  }, [decrementIntervalMs, minRemaining]);

  const pct = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));

  return (
    <div
      className={
        className ??
        "w-full max-w-md rounded-2xl border border-orange-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm"
      }
    >
      <div className="flex items-center justify-between text-sm font-semibold text-orange-700">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="h-4 w-4" />
          Restam {remaining} de {total} vagas
        </span>
        <span className="text-slate-500 text-xs font-medium">{Math.round(pct)}% preenchido</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-white overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
