import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageIcon } from "@/lib/page-icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { GuestPagePreview } from "@/components/guest/GuestPagePreview";
import { GuestLinkExpired } from "@/components/guest/GuestLinkExpired";
import { InstallAppButton } from "@/components/guest/InstallAppButton";
import { LanguageSwitcher } from "@/components/guest/LanguageSwitcher";
import { SocialLinks } from "@/components/guest/SocialLinks";
import { LeadCaptureBar } from "@/components/guest/LeadCaptureBar";
import { GuideI18nProvider, useGuideT, type GuideLocale } from "@/lib/i18n-guide";
import { Seo } from "@/components/Seo";

export default function GuestGuide() {
  const { slug } = useParams<{ slug: string }>();
  const [activePageKey, setActivePageKey] = useState<string | null>(null);
  const [locale, setLocale] = useState<GuideLocale>(() => {
    if (typeof window === "undefined") return "pt";
    const saved = localStorage.getItem(`guide-locale-${slug ?? ""}`);
    return (saved === "en" || saved === "es" || saved === "pt") ? saved : "pt";
  });

  const handleLocaleChange = (l: GuideLocale) => {
    setLocale(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(`guide-locale-${slug ?? ""}`, l);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["guide", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: property, error } = await supabase
        .from("properties")
        .select(`
          id, name, address, booking_url, cover_image_url, public_slug, status,
          tenants!inner(id, name, primary_color, secondary_color, template, is_active, logo_url, show_logo, plan_code, instagram_url, facebook_url),
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

  // Update dynamic PWA manifest + theme/icon per property (title/description handled by Helmet)
  useEffect(() => {
    if (!data) return;
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ---- Dynamic PWA manifest ----
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const origin = window.location.origin;
    const manifestUrl = `${supabaseUrl}/functions/v1/property-manifest?slug=${encodeURIComponent(
      data.public_slug
    )}&origin=${encodeURIComponent(origin)}`;

    // Replace the manifest link (use a dedicated id so we don't fight the static one)
    const staticManifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prevHref = staticManifest?.getAttribute("href") ?? null;
    if (staticManifest) staticManifest.setAttribute("href", manifestUrl);

    // Theme color from tenant
    const tenantPrimary = data.tenants?.primary_color as string | undefined;
    const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const prevTheme = themeMeta?.getAttribute("content") ?? null;
    if (themeMeta && tenantPrimary) themeMeta.setAttribute("content", tenantPrimary);

    // Apple touch icon: prefer tenant logo, fallback to cover
    const appleIconHref = data.tenants?.logo_url || data.cover_image_url || null;
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    const prevAppleIcon = appleIcon?.getAttribute("href") ?? null;
    if (appleIcon && appleIconHref) appleIcon.setAttribute("href", appleIconHref);

    // Apple web app title
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
    const prevAppleTitle = appleTitle?.getAttribute("content") ?? null;
    if (appleTitle) appleTitle.setAttribute("content", data.name);

    // Color-scheme: prevent Chrome Android auto-dark from inverting light templates
    const darkTemplates = ["dark", "arcade", "coastal_boho", "jungle"];
    const scheme = darkTemplates.includes(data.tenants?.template) ? "dark" : "light";
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
    const createdColorScheme = !colorSchemeMeta;
    const prevColorScheme = colorSchemeMeta?.getAttribute("content") ?? null;
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement("meta");
      colorSchemeMeta.setAttribute("name", "color-scheme");
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute("content", scheme);

    return () => {
      // Restore defaults when leaving the guide
      if (staticManifest && prevHref !== null) staticManifest.setAttribute("href", prevHref);
      if (themeMeta && prevTheme !== null) themeMeta.setAttribute("content", prevTheme);
      if (appleIcon && prevAppleIcon !== null) appleIcon.setAttribute("href", prevAppleIcon);
      if (appleTitle && prevAppleTitle !== null) appleTitle.setAttribute("content", prevAppleTitle);
      if (colorSchemeMeta) {
        if (createdColorScheme) colorSchemeMeta.remove();
        else if (prevColorScheme !== null) colorSchemeMeta.setAttribute("content", prevColorScheme);
      }
    };
  }, [data]);

  // Apply template class
  const template = tenant?.template ?? "clean";

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!data) {
    return <GuestLinkExpired slug={slug!} />;
  }

  const primaryColor = tenant?.primary_color ?? "#0F1E3D";
  const activePage = pages.find((p) => p.page_key === activePageKey);

  return (
    <GuideI18nProvider slug={slug!} locale={locale}>
      <GuideBody
        showLeadBar={slug === "suite-premium-vila-serena-23515a"}
        data={data}
        tenant={tenant}
        pages={pages}
        template={template}
        primaryColor={primaryColor}
        activePage={activePage}
        activePageKey={activePageKey}
        setActivePageKey={setActivePageKey}
        locale={locale}
        onLocaleChange={handleLocaleChange}
      />
    </GuideI18nProvider>
  );
}

function GuideBody({
  data, tenant, pages, template, primaryColor, activePage, activePageKey, setActivePageKey, locale, onLocaleChange,
}: any) {
  const { t, isLoading: tLoading } = useGuideT();
  const seoTitle = `${data.name} — Guia do Hóspede`;
  const seoDesc = data.address
    ? `Guia digital do hóspede para ${data.name}, em ${data.address}. Check-in, dicas e informações da sua estadia.`
    : `Guia digital do hóspede para ${data.name}. Check-in, dicas e informações da sua estadia.`;
  const lodgingLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: data.name,
    url: `https://hub.mrflow.com.br/g/${data.public_slug}`,
  };
  if (data.address) lodgingLd.address = { "@type": "PostalAddress", streetAddress: data.address };
  if (data.cover_image_url) lodgingLd.image = data.cover_image_url;
  return (
    <div className={`guide-root guide-template-${template} min-h-screen pt-12 sm:pt-14`}>
      <LeadCaptureBar />
      <Seo
        title={seoTitle}
        description={seoDesc}
        path={`/g/${data.public_slug}`}
        image={data.cover_image_url || undefined}
        jsonLd={lodgingLd}
      />
      {/* Hero */}
      <div className="relative">
        <LanguageSwitcher locale={locale} onChange={onLocaleChange} isLoading={tLoading} />
        <SocialLinks instagramUrl={tenant?.instagram_url} facebookUrl={tenant?.facebook_url} />
        <div className="aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] w-full overflow-hidden">
          {data.cover_image_url ? (
            <img src={data.cover_image_url} alt={data.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
        </div>

        {/* Logo flutuante sobre a capa */}
        {tenant?.show_logo && tenant?.logo_url && (tenant?.plan_code === "pro" || tenant?.plan_code === "business") && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6 z-20">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white shadow-lg overflow-hidden ring-4 ring-white/80 grid place-items-center">
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold drop-shadow-lg">{data.name}</h1>
          {data.address && <p className="text-sm sm:text-base opacity-90 mt-2 drop-shadow">{t(data.address)}</p>}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
        {/* Título da seção */}
        <div className="text-center mt-6 mb-4">
          <h2 className="text-sm font-semibold tracking-[0.25em] uppercase" style={{ color: primaryColor }}>
            {t("Hub de Boas Vindas")}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 pb-6">
          {pages.map((p: any) => {
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
                  {t(p.title)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reservar (após os ícones) */}
        {data.booking_url && (
          <Button
            asChild
            size="lg"
            className="guide-cta-primary w-full h-14 text-base font-semibold tracking-wider uppercase rounded-2xl shadow-hero mt-2"
            style={{ background: primaryColor, color: "#fff" }}
          >
            <a href={data.booking_url} target="_blank" rel="noreferrer noopener">
              <Calendar className="mr-2 h-5 w-5" /> {t("Reservar Novamente")}
          </a>
          </Button>
        )}

        {/* Instalar App */}
        <InstallAppButton primaryColor={primaryColor} />

        {/* Rodapé */}
        <footer className="mt-10 pb-8 text-center text-[11px] leading-relaxed" style={{ color: "hsl(var(--guide-muted))" }}>
          ©  2026 –{" "}
          <a
            href="http://mrflow.com.br"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:opacity-80"
          >
            Mr. Flow Automações e Serviços Digitais LTDA
          </a>{" "}
          – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
        </footer>
      </div>

      {/* Page detail sheet */}
      <Sheet open={!!activePageKey} onOpenChange={(o) => {
        if (!o) {
          const closedKey = activePageKey;
          setActivePageKey(null);
          if (closedKey && typeof window !== "undefined" && window.parent && window.parent !== window) {
            try {
              window.parent.postMessage({ type: "wh_demo_page_closed", pageKey: closedKey }, "*");
            } catch {}
          }
        }
      }}>

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
