import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface OfferState {
  remainingMs: number;
  expired: boolean;
  deadline: number;
}

const OfferStatusContext = createContext<OfferState | null>(null);

function readDeadline(storageKey: string, durationMs: number): number {
  if (typeof window === "undefined") return Date.now() + durationMs;
  const raw = window.localStorage.getItem(storageKey);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed)) return parsed;
  const deadline = Date.now() + durationMs;
  window.localStorage.setItem(storageKey, String(deadline));
  return deadline;
}

export function useOfferDeadline(storageKey: string, durationMs: number): OfferState {
  const [deadline] = useState<number>(() => readDeadline(storageKey, durationMs));
  const [remainingMs, setRemainingMs] = useState<number>(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return { remainingMs, expired: remainingMs <= 0, deadline };
}

interface ProviderProps {
  storageKey: string;
  durationMs: number;
  onExpire?: () => void;
  children: ReactNode;
}

export function OfferStatusProvider({ storageKey, durationMs, onExpire, children }: ProviderProps) {
  const state = useOfferDeadline(storageKey, durationMs);
  const fired = useRef(false);

  useEffect(() => {
    if (state.expired && !fired.current) {
      fired.current = true;
      onExpire?.();
    }
  }, [state.expired, onExpire]);

  const value = useMemo(() => state, [state.remainingMs, state.expired, state.deadline]);
  return <OfferStatusContext.Provider value={value}>{children}</OfferStatusContext.Provider>;
}

export function useOfferStatus(): OfferState {
  const ctx = useContext(OfferStatusContext);
  if (!ctx) return { remainingMs: Infinity, expired: false, deadline: 0 };
  return ctx;
}
