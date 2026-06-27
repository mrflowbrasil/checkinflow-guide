import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export function useHasReservationsIntegration() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["reservations_integration", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const [{ data: integs }, { count }] = await Promise.all([
        supabase
          .from("tenant_integrations")
          .select("provider, status")
          .eq("tenant_id", tenant!.id)
          .in("provider", ["stays", "hostaway"])
          .eq("status", "connected"),
        supabase
          .from("reservations_import")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant!.id),
      ]);
      const providers = (integs ?? []).map((r) => r.provider as string);
      const hasData = (count ?? 0) > 0;
      return { connected: providers.length > 0 || hasData, providers, hasData };
    },
  });
}

const keepPrev = <T,>(prev: T | undefined) => prev;

export type DateBasis = "check_in" | "booked_at";

async function fetchAllPaged(column: string, start: string | null, end: string | null, tenantId: string) {
  const pageSize = 1000;
  let from = 0;
  const all: any[] = [];
  for (;;) {
    let q = supabase
      .from("v_reservations_dashboard" as any)
      .select("*")
      .eq("tenant_id", tenantId)
      .order(column, { ascending: true })
      .range(from, from + pageSize - 1);
    if (start) q = q.gte(column, start);
    if (end) q = q.lte(column, end);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as any[];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
    if (from > 50_000) break; // safety
  }
  return all;
}

export function useReservationsRange(
  start: string,
  end: string,
  dateBasis: DateBasis = "check_in",
) {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["v_reservations_dashboard", tenant?.id, dateBasis, start, end],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    placeholderData: keepPrev,
    retry: 1,
    queryFn: async () => fetchAllPaged(dateBasis, start, end, tenant!.id),
  });
}

export function useReservationsAll(dateBasis: DateBasis = "check_in") {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["v_reservations_dashboard_all", tenant?.id, dateBasis],
    enabled: !!tenant?.id,
    staleTime: 5 * 60_000,
    placeholderData: keepPrev,
    retry: 1,
    queryFn: async () => fetchAllPaged(dateBasis, null, null, tenant!.id),
  });
}

export function useUpcomingCheckins(limit = 20) {
  const { data: tenant } = useTenant();
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["v_reservations_upcoming", tenant?.id, today],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    placeholderData: keepPrev,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_reservations_dashboard" as any)
        .select("*")
        .gte("check_in", today)
        .neq("status", "canceled")
        .order("check_in", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useMonthlyMetrics() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["v_dashboard_monthly_metrics", tenant?.id],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    placeholderData: keepPrev,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_dashboard_monthly_metrics" as any)
        .select("*")
        .order("month", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function usePropertyMetrics() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["v_dashboard_property_metrics", tenant?.id],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    placeholderData: keepPrev,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_dashboard_property_metrics" as any)
        .select("*")
        .order("revenue", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useLastSyncedAt() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["last_synced_at", tenant?.id],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations_import")
        .select("synced_at")
        .eq("tenant_id", tenant!.id)
        .order("synced_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.synced_at ?? null;
    },
  });
}
