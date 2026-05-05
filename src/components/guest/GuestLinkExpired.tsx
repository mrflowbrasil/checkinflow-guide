import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Loader2 } from "lucide-react";

export function GuestLinkExpired({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["expired_slug", slug],
    queryFn: async () => {
      const { data: history } = await supabase
        .from("property_slug_history")
        .select("property_id, properties(name, booking_url, tenants(name, primary_color, template, support_whatsapp, logo_url, show_logo, plan_code))")
        .eq("slug", slug)
        .maybeSingle();
      return history as any;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const prop = data?.properties;
  const tenant = prop?.tenants;
  const template = (tenant?.template ?? "clean") as "clean" | "dark" | "luxury";
  const primaryColor = tenant?.primary_color ?? "#0F1E3D";
  const bookingUrl = prop?.booking_url ?? null;
  const whatsapp = tenant?.support_whatsapp
    ? tenant.support_whatsapp.replace(/\D/g, "")
    : null;
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Preciso de ajuda com o link do guia do hóspede.")}`
    : null;

  return (
    <div className={`guide-root guide-template-${template} min-h-screen flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto w-full">
        {tenant?.show_logo && tenant?.logo_url && (tenant?.plan_code === "pro" || tenant?.plan_code === "business") && (
          <div className="h-20 w-20 rounded-full bg-white shadow-lg overflow-hidden ring-4 ring-white/80 grid place-items-center mb-6">
            <img src={tenant.logo_url} alt={tenant?.name ?? ""} className="h-full w-full object-cover" />
          </div>
        )}

        <div
          className="h-16 w-16 rounded-full grid place-items-center mb-5"
          style={{ background: `${primaryColor}1a`, color: primaryColor }}
        >
          <Calendar className="h-8 w-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold mb-3" style={{ color: "hsl(var(--guide-fg))" }}>
          Este link expirou
        </h1>
        <p className="text-base mb-8" style={{ color: "hsl(var(--guide-muted))" }}>
          O acesso a este guia foi atualizado. Faça uma nova reserva para receber um novo link de acesso.
        </p>

        {bookingUrl && (
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold tracking-wider uppercase rounded-2xl shadow-hero mb-3"
            style={{ background: primaryColor, color: "#fff" }}
          >
            <a href={bookingUrl} target="_blank" rel="noreferrer noopener">
              <Calendar className="mr-2 h-5 w-5" /> Reservar novamente
            </a>
          </Button>
        )}

        {whatsappUrl && (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold tracking-wider uppercase rounded-2xl"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <a href={whatsappUrl} target="_blank" rel="noreferrer noopener">
              <MessageCircle className="mr-2 h-5 w-5" /> Ajuda
            </a>
          </Button>
        )}

        {!bookingUrl && !whatsappUrl && (
          <p className="text-sm" style={{ color: "hsl(var(--guide-muted))" }}>
            Entre em contato com o anfitrião para receber o novo link.
          </p>
        )}
      </div>

      <footer className="pb-6 text-center text-[11px] px-4" style={{ color: "hsl(var(--guide-muted))" }}>
        © 2026 –{" "}
        <a href="http://mrflow.com.br" target="_blank" rel="noreferrer noopener" className="underline hover:opacity-80">
          Mr. Flow Automações e Serviços Digitais LTDA
        </a>
      </footer>
    </div>
  );
}
