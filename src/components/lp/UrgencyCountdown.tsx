import { useEffect, useState } from "react";

interface Props {
  /** Target date ISO string. When passed, this wins over durationMs. */
  targetDate?: string;
  /** Rolling countdown duration in ms. Persisted in localStorage under `storageKey`. */
  durationMs?: number;
  storageKey?: string;
  className?: string;
  labelClassName?: string;
  compact?: boolean;
  /** When true, stop at 00:00 (do not rolling-reset) and switch to expired visuals. */
  stopOnZero?: boolean;
  expiredLabel?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Reusable urgency countdown.
 * - If `targetDate` is set: counts down to that exact moment.
 * - Otherwise: uses `durationMs` and persists the deadline in localStorage
 *   so refreshes don't reset the timer.
 * - `stopOnZero`: when true, stops at 00:00 and paints an "expired" state
 *   instead of the default rolling reset.
 */
export default function UrgencyCountdown({
  targetDate,
  durationMs = 3 * 60 * 60 * 1000, // 3 hours
  storageKey = "lp:urgente:deadline",
  className,
  labelClassName,
  compact,
  stopOnZero,
  expiredLabel = "Oferta expirada",
}: Props) {
  const [remaining, setRemaining] = useState<number>(() => computeRemaining());

  function computeRemaining(): number {
    if (targetDate) {
      const t = new Date(targetDate).getTime();
      return Math.max(0, t - Date.now());
    }
    if (typeof window === "undefined") return durationMs;
    const raw = window.localStorage.getItem(storageKey);
    let deadline = raw ? Number(raw) : NaN;
    if (!Number.isFinite(deadline)) {
      deadline = Date.now() + durationMs;
      window.localStorage.setItem(storageKey, String(deadline));
    } else if (deadline - Date.now() <= 0 && !stopOnZero) {
      // rolling reset when not stopping on zero
      deadline = Date.now() + durationMs;
      window.localStorage.setItem(storageKey, String(deadline));
    }
    return Math.max(0, deadline - Date.now());
  }

  useEffect(() => {
    const id = setInterval(() => {
      const r = computeRemaining();
      if (r <= 0 && !targetDate && !stopOnZero) {
        // rolling reset
        const deadline = Date.now() + durationMs;
        window.localStorage.setItem(storageKey, String(deadline));
        setRemaining(durationMs);
      } else {
        setRemaining(r);
        if (r <= 0 && stopOnZero) {
          clearInterval(id);
        }
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate, durationMs, storageKey, stopOnZero]);

  const isExpired = stopOnZero && remaining <= 0;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center">
      <div
        className={
          compact
            ? "font-mono text-lg font-bold text-white tabular-nums"
            : "font-mono text-3xl sm:text-4xl font-extrabold text-white tabular-nums leading-none"
        }
      >
        {pad(v)}
      </div>
      <div className={labelClassName ?? "text-[10px] uppercase tracking-widest text-white/70 mt-1"}>
        {l}
      </div>
    </div>
  );

  const activeClass =
    className ??
    "inline-flex items-center gap-3 sm:gap-5 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 px-5 py-3 shadow-[0_15px_40px_-15px_rgba(220,38,38,0.6)]";
  const expiredClass = isExpired
    ? " !bg-none !bg-slate-500/80 !shadow-none opacity-80"
    : "";

  if (isExpired) {
    return (
      <div
        className={activeClass + expiredClass}
        role="timer"
        aria-live="polite"
        aria-label={expiredLabel}
      >
        <div className={compact ? "text-xs font-bold uppercase tracking-widest text-white" : "text-sm sm:text-base font-extrabold uppercase tracking-widest text-white"}>
          {expiredLabel}
        </div>
      </div>
    );
  }

  return (
    <div
      className={activeClass}
      role="timer"
      aria-live="polite"
    >
      <Cell v={hours} l="hrs" />
      <span className="text-white/70 font-bold">:</span>
      <Cell v={minutes} l="min" />
      <span className="text-white/70 font-bold">:</span>
      <Cell v={seconds} l="seg" />
    </div>
  );
}
