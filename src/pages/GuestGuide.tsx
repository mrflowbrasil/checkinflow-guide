import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageIcon } from "@/lib/page-icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { GuestPagePreview } from "@/components/guest/GuestPagePreview";

export default function GuestGuide() {
  const { slug } = useParams<{ slug: string }>();
  const [activePageKey, setActivePageKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["guide", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: property, error } = await supabase
        .from("properties")
        .select(`
          id, name, address, booking_url, cover_image_url, public_slug, status,
          tenants!inner(id, name, primary_color, secondary_color, template, is_active, logo_url, show_logo),
          property_pages(id, page_key, title, icon, position, is_enabled)
        `)
        .eq("public_slug", slug!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      if (!property) return null;
      return property as any;
    },
  });

  const tenant = data?.tenants;
  const pages = useMemo(
    () => (data?.property_pages as any[] | undefined ?? []).filter((p) => p.is_enabled).sort((a, b) => a.position - b.position),
    [data]
  );

  // Update meta tags
  useEffect(() => {
    if (!data) return;
    const title = `${data.name} — Guia do Hóspede`;
    document.title = title;
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", `Guia digital do hóspede para ${data.name}.`);
  }, [data]);

  // Apply template class
  const template = tenant?.template ?? "clean";

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Guia não encontrado</h1>
          <p className="text-muted-foreground text-sm">Este link pode ter expirado ou estar despublicado.</p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant?.primary_color ?? "#0F1E3D";
  const activePage = pages.find((p) => p.page_key === activePageKey);

  return (
    <div className={`guide-root guide-template-${template} min-h-screen`}>
      {/* Logo da empresa */}
      {tenant?.show_logo && tenant?.logo_url && (
        <div className="w-full grid place-items-center pt-4 pb-2 px-4">
          <img src={tenant.logo_url} alt={tenant.name} className="max-h-16 w-auto object-contain" />
        </div>
      )}

      {/* Hero */}
      <div className="relative">
        <div className="aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] w-full overflow-hidden">
          {data.cover_image_url ? (
            <img src={data.cover_image_url} alt={data.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold drop-shadow-lg">{data.name}</h1>
          {data.address && <p className="text-sm sm:text-base opacity-90 mt-2 drop-shadow">{data.address}</p>}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
        {/* Reservar */}
        {data.booking_url && (
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold tracking-wider uppercase rounded-2xl shadow-hero"
            style={{ background: primaryColor, color: "#fff" }}
          >
            <a href={data.booking_url} target="_blank" rel="noreferrer noopener">
              <Calendar className="mr-2 h-5 w-5" /> Reservar
            </a>
          </Button>
        )}

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pb-10">
          {pages.map((p) => {
            const Icon = getPageIcon(p.icon);
            const isEmergency = p.page_key === "emergency";
            return (
              <button
                key={p.id}
                onClick={() => setActivePageKey(p.page_key)}
                className="guide-card aspect-square flex flex-col items-center justify-center gap-2 p-2 transition-all active:scale-95 shadow-card hover:shadow-card-hover"
              >
                <Icon
                  className="h-7 w-7"
                  style={{ color: isEmergency ? "hsl(var(--destructive))" : primaryColor }}
                />
                <span className="text-xs font-medium text-center leading-tight" style={{ color: isEmergency ? "hsl(var(--destructive))" : "hsl(var(--guide-fg))" }}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page detail sheet */}
      <Sheet open={!!activePageKey} onOpenChange={(o) => !o && setActivePageKey(null)}>
        <SheetContent side="bottom" className="h-[88vh] p-0 rounded-t-3xl border-t-0 max-w-md mx-auto">
          {activePage && <PageContent pageId={activePage.id} title={activePage.title} icon={activePage.icon} template={template} primaryColor={primaryColor} onClose={() => setActivePageKey(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PageContent({ pageId, title, icon, template, primaryColor, onClose }: { pageId: string; title: string; icon?: string; template: "clean" | "dark" | "luxury"; primaryColor?: string; onClose: () => void }) {
  const { data: blocks } = useQuery({
    queryKey: ["guide_page_blocks", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_id", pageId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });
  return <GuestPagePreview template={template} pageTitle={title} pageIcon={icon} primaryColor={primaryColor} blocks={(blocks ?? []) as any} onBack={onClose} />;
}
