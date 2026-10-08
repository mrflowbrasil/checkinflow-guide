import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seo } from "@/components/Seo";
import { validateGuestPhone } from "../../supabase/functions/_shared/guest-phone";

export default function GuestPhoneConfirmation() {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const [reservation, setReservation] = useState(() => params.get("reserva") ?? params.get("id_reserva") ?? "");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["guest-phone-brand", slug], enabled: Boolean(slug),
    queryFn: async () => {
      const { data: property, error } = await supabase.from("properties")
        .select("name, public_slug, tenants(name, template, logo_url, primary_color, secondary_color, is_active, button_shape, button_border)")
        .eq("public_slug", slug ?? "").eq("status", "active").maybeSingle();
      if (error) throw error;
      return property;
    },
  });
  const tenant = data?.tenants;
  useEffect(() => {
    const primary = tenant?.primary_color;
    if (primary && /^#[\da-f]{6}$/i.test(primary)) root.current?.style.setProperty("--phone-cta", primary);
  }, [tenant?.primary_color, isLoading]);
  useEffect(() => {
    setReservation(params.get("reserva") ?? params.get("id_reserva") ?? "");
    setSent(false); setMessage(""); setPhone("");
  }, [params, slug]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    setMessage("");
    let payload;
    try { payload = validateGuestPhone({ id_reserva: reservation, telefone: phone }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Verifique os dados."); return; }
    locked.current = true; setSending(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("confirm-guest-phone", {
        body: { slug, ...payload },
      });
      if (error) {
        const response = error.context;
        if (response instanceof Response) {
          const details = await response.json().catch(() => null);
          throw new Error(details?.error ?? "Não foi possível enviar agora. Tente novamente.");
        }
        throw new Error("Não foi possível enviar agora. Tente novamente.");
      }
      if (result?.success !== true) throw new Error(result?.error ?? "Não foi possível enviar agora. Tente novamente.");
      setSent(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar agora. Tente novamente.");
    } finally { locked.current = false; setSending(false); }
  }

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="animate-spin" aria-label="Carregando" /></div>;
  if (error || !data || !tenant?.is_active) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Não foi possível carregar a hospedagem</h1>
      <Button onClick={() => void refetch()}>Tentar novamente</Button>
    </main>
  );
  return (
    <div ref={root} className={`guide-root guide-template-${tenant.template ?? "clean"} guest-phone-page min-h-screen`}
      data-btn-shape={tenant.button_shape ?? "rounded"} data-btn-border={tenant.button_border ?? "none"}>
      <Seo title={`Confirme seu celular | ${tenant.name}`} description="Confirme seu celular para receber informações sobre sua hospedagem."
        path={`/g/${slug}/confirmar-celular`} noindex />
      <main className="mx-auto w-full max-w-lg px-6 pb-12 pt-10 sm:pt-16">
        <header className="mb-10 flex flex-col items-center gap-4 text-center">
          <img src={tenant.logo_url || "/mrflow-logo.webp"} alt={tenant.logo_url ? tenant.name : "Mr Flow"} width={160} height={80} className="h-20 w-40 object-contain" />
          <p className="text-base font-semibold">{tenant.name}</p>
        </header>
        {sent ? (
          <section role="status" className="space-y-5 py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12" />
            <h1 className="text-3xl font-semibold">Celular confirmado!</h1>
            <p className="text-base leading-relaxed">Obrigado! Recebemos seu número para enviar as informações da sua hospedagem.</p>
          </section>
        ) : (
          <>
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase">Aviso importante</p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Confirme seu celular para sua hospedagem</h1>
              <p className="text-base leading-relaxed">O número de celular pode não ser compartilhado pela Booking.com com a hospedagem. Para receber as informações da sua chegada, confirme seu contato abaixo.</p>
              <p className="text-sm leading-relaxed">Sua reserva continua válida. Esta confirmação é apenas para facilitar nossa comunicação.</p>
            </div>
            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="reservation">ID da reserva</Label>
                <Input id="reservation" value={reservation} onChange={event => setReservation(event.target.value)}
                  maxLength={100} autoComplete="off" required disabled={sending} className="guest-phone-input h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Celular</Label>
                <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+55 (11) 99999-9999"
                  value={phone} onChange={event => setPhone(event.target.value)} maxLength={40} required disabled={sending}
                  aria-describedby="phone-note" className="guest-phone-input h-12" />
                <p id="phone-note" className="text-xs leading-relaxed">Inclua o código do país e o DDD.</p>
              </div>
              {message && <p role="alert" className="text-sm font-medium">{message}</p>}
              <Button type="submit" disabled={sending} className="guide-cta-primary guest-phone-submit h-12 w-full text-base">
                {sending ? <Loader2 className="animate-spin" /> : <Send />} {sending ? "Enviando…" : "Confirmar celular"}
              </Button>
              <p className="flex items-start gap-2 text-xs leading-relaxed"><ShieldCheck className="h-4 w-4 shrink-0" />
                Ao enviar, você compartilha seu celular com a hospedagem para comunicações relacionadas à reserva.</p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}