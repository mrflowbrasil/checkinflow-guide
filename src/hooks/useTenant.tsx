import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  show_logo: boolean;
  template: "clean" | "dark" | "luxury";
  is_active: boolean;
  plan_code: string;
  plan_status: string;
};

export function useTenant() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Tenant | null> => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user!.id)
        .maybeSingle();
      if (!profile?.tenant_id) return null;
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profile.tenant_id)
        .maybeSingle();
      return tenant as Tenant | null;
    },
  });
}

export function useIsSuperAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is_super_admin", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<boolean> => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "super_admin")
        .maybeSingle();
      return !!data;
    },
  });
}

export function usePlanUsage() {
  const { data: tenant } = useTenant();
  return useQuery({
    queryKey: ["plan_usage", tenant?.id, tenant?.plan_code],
    enabled: !!tenant,
    queryFn: async () => {
      const [{ data: plan }, { count }] = await Promise.all([
        supabase
          .from("subscription_plans")
          .select("code, name, property_limit, price_cents")
          .eq("code", tenant!.plan_code)
          .maybeSingle(),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant!.id),
      ]);
      const used = count ?? 0;
      const limit = plan?.property_limit ?? 1;
      return {
        plan: plan!,
        used,
        limit,
        atLimit: used >= limit,
        unlimited: limit >= 999,
      };
    },
  });
}
