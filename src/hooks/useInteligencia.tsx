import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export function useHasReservationsIntegration() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["reservations_integration", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_integrations")
        .select("provider, status")
        .eq("tenant_id", tenant!.id)
        .in("provider", ["stays", "hostaway"])
        .eq("status", "connected");
      const providers = (data ?? []).map((r) => r.provider as string);
      return { connected: providers.length > 0, providers };
    },
  });
}

export function useReservationsRange(start: string, end: string) {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["v_reservations_dashboard", tenant?.id, start, end],
    enabled: !!tenant?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_reservations_dashboard" as any)
        .select("*")
        .gte("check_in", start)
        .lte("check_in", end)
        .order("check_in", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useUpcomingCheckins(limit = 20) {
  const { data: tenant } = useTenant();
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["v_reservations_upcoming", tenant?.id, today],
    enabled: !!tenant?.id,
    staleTime: 60_000,
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
