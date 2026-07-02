import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  /** Total slots for the launch batch. */
  total?: number;
  /** Fallback remaining shown while loading / on error. Set to a real, honest number. */
  fallbackRemaining?: number;
  className?: string;
}

type Slots = { limit: number; sold: number; remaining: number; available: boolean };

/**
 * Displays the real number of remaining launch slots.
 * Reads from the same `get_launch_slots` RPC used by LaunchOffer, so the
 * number always reflects reality (avoids fake scarcity / ad-account risk).
 */
export default function SpotsRemaining({ total = 100, fallbackRemaining = 100, className }: Props) {
  const [slots, setSlots] = useState<Slots | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.rpc("get_launch_slots").then(({ data }) => {
      if (mounted && data) setSlots(data as unknown as Slots);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const remaining = slots?.remaining ?? fallbackRemaining;
  const limit = slots?.limit ?? total;
  const pct = Math.max(0, Math.min(100, ((limit - remaining) / limit) * 100));
  const soldOut = slots ? !slots.available : false;

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
          {soldOut ? "Lote encerrado" : `Restam ${remaining} de ${limit} vagas`}
        </span>
        <span className="text-slate-500 text-xs font-medium">{Math.round(pct)}% preenchido</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-orange-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
