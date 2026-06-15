import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";

import { CatalogHeader } from "@/components/catalog/public/CatalogHeader";
import { CatalogFilters, type Filters } from "@/components/catalog/public/CatalogFilters";
import { CatalogResultCard } from "@/components/catalog/public/CatalogResultCard";
import { CatalogSkeleton } from "@/components/catalog/public/CatalogSkeleton";

export type PublicProperty = {
  id: string;
  name: string;
  city: string | null;
  max_guests: number | null;
  base_price: number | null;
  cover_image_url: string | null;
  public_slug: string;
  booking_url: string | null;
  source: "manual" | "stays" | "hub";
};

type TenantInfo = {
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  bio: string | null;
};

type IntegrationInfo = { provider: string; system_url: string | null } | null;

export default function PublicCatalog() {
  const { tenantSlug = "" } = useParams();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [hasLiveAvailability, setHasLiveAvailability] = useState(false);
  const [integration, setIntegration] = useState<IntegrationInfo>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    checkin: null,
    checkout: null,
    guests: null,
    maxPrice: null,
  });

  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PublicProperty[] | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-public?tenant_slug=${encodeURIComponent(tenantSlug)}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        if (!res.ok) throw new Error("not_found");
        const json = await res.json();
        if (cancelled) return;
        setTenant(json.tenant);
        setProperties(json.properties ?? []);
        setHasLiveAvailability(!!json.has_live_availability);
        setIntegration(json.integration ?? null);
      } catch {
        if (!cancelled) setError("Catálogo não encontrado.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  // Local filter (guests + maxPrice only)
  const locallyFiltered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.guests && (p.max_guests ?? 0) < filters.guests) return false;
      if (filters.maxPrice && (p.base_price ?? 0) > filters.maxPrice) return false;
      return true;
    });
  }, [properties, filters]);

  const displayList = hasLiveAvailability ? (searchResults ?? locallyFiltered) : locallyFiltered;

  const priceMax = useMemo(() => {
    const max = properties.reduce((acc, p) => Math.max(acc, p.base_price ?? 0), 0);
    return Math.max(500, Math.ceil(max / 100) * 100);
  }, [properties]);

  const handleSearch = async () => {
    if (!tenant || !hasLiveAvailability) return;
    setSearching(true);
    setSearched(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("catalog-search", {
        body: {
          tenant_slug: tenant.slug,
          checkin: filters.checkin,
          checkout: filters.checkout,
          guests: filters.guests ?? undefined,
          max_price: filters.maxPrice ?? undefined,
          integration_url: integration?.system_url ?? undefined,
        },
      });
      if (fnError) throw fnError;
      setSearchResults((data?.properties ?? []) as PublicProperty[]);
    } catch (e) {
      console.error(e);
      setSearchResults(locallyFiltered);
    } finally {
      setSearching(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Catálogo não encontrado</h1>
          <p className="text-muted-foreground text-sm mt-2">Verifique se o link está correto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Seo
        title={tenant ? `Catálogo · ${tenant.name}` : "Catálogo"}
        description={tenant?.bio ?? "Encontre sua próxima estadia"}
        path={`/c/${tenantSlug}`}
        noindex
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading || !tenant ? (
          <>
            <CatalogSkeleton header />
            <CatalogSkeleton />
          </>
        ) : (
          <>
            <CatalogHeader tenant={tenant} />
            <CatalogFilters
              filters={filters}
              onChange={setFilters}
              priceMax={priceMax}
              onSearch={handleSearch}
              searching={searching}
              hasLiveAvailability={hasLiveAvailability}
            />

            {searching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CatalogSkeleton key={i} />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
                {searched
                  ? "Nenhum imóvel disponível para estas datas, tente outro período."
                  : "Nenhum imóvel disponível no momento."}
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayList.map((p) => (
                  <li key={p.id} className="h-full">
                    <CatalogResultCard property={p} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
