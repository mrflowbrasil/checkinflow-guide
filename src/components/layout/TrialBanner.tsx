import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function TrialBanner() {
  const { data: tenant } = useTenant();
  if (!tenant) return null;
  const status = tenant.trial_status;
  if (!status || status === "converted" || status === "waived") return null;

  if (status === "expired") {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Seu teste grátis terminou. Os links dos hóspedes estão offline até você ativar um plano.
          </span>
        </div>
        <Link
          to="/app/billing"
          className="rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700"
        >
          Ativar plano
        </Link>
      </div>
    );
  }

  const days = daysUntil(tenant.trial_ends_at);
  if (days === null) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-900">
        <Clock className="h-4 w-4" />
        <span>
          {days > 0
            ? `Seu teste grátis termina em ${days} ${days === 1 ? "dia" : "dias"}.`
            : "Seu teste grátis termina hoje."}
        </span>
      </div>
      <Link
        to="/app/billing"
        className="rounded-md bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700"
      >
        Ver planos
      </Link>
    </div>
  );
}
