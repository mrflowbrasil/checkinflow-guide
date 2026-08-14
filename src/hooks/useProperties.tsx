import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

/**
 * Fonte única de verdade dos imóveis do workspace.
 * Usada tanto pela página /app/properties quanto por /app/catalog,
 * garantindo que qualquer imóvel criado ou importado apareça nos dois lugares.
 */
export type PropertyRow = {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  city: string | null;
  max_guests: number | null;
  base_price: number | null;
  cover_image_url: string | null;
  public_slug: string;
  booking_url: string | null;
  status: "active" | "inactive";
  source: "manual" | "stays" | "hub";
  external_provider: string | null;
};

export const PROPERTIES_QUERY_KEY = "properties";

const COLUMNS =
  "id, tenant_id, name, address, city, max_guests, base_price, cover_image_url, public_slug, booking_url, status, source, external_provider";

export function useProperties() {
  const { data: tenant } = useTenant();

  return useQuery({
    queryKey: [PROPERTIES_QUERY_KEY, tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async (): Promise<PropertyRow[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select(COLUMNS)
        .eq("tenant_id", tenant!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyRow[];
    },
  });
}

export function useInvalidateProperties() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [PROPERTIES_QUERY_KEY] });
}
