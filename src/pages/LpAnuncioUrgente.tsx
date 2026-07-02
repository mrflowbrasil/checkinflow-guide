import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Clock,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import mrFlowLogo from "@/assets/mrflow-logo.png";
import denizeAvatar from "@/assets/lp/avatars/denize.webp.asset.json";
import pabloAvatar from "@/assets/lp/avatars/pablo.webp.asset.json";
import julianaAvatar from "@/assets/lp/avatars/juliana.webp.asset.json";
import TrustLogos from "@/components/lp/TrustLogos";
import VideoCriacao from "@/components/lp/VideoCriacao";
import LaunchOffer, { openLaunchCheckout } from "@/components/lp/LaunchOffer";
import GarantiaSection from "@/components/lp/GarantiaSection";
import UrgencyCountdown from "@/components/lp/UrgencyCountdown";
import SpotsRemaining from "@/components/lp/SpotsRemaining";
import ActivityTicker from "@/components/lp/ActivityTicker";
import ExitIntentDialog from "@/components/lp/ExitIntentDialog";
import OfferExpiredDialog from "@/components/lp/OfferExpiredDialog";
import { OfferStatusProvider, useOfferStatus } from "@/hooks/useOfferDeadline";
import { Reveal } from "@/hooks/useReveal";

// ================== CONFIG (editar aqui, nada chumbado no meio do código) ==================
const CONFIG = {
  totalSpots: 100,
  initialRemaining: 57,
  spotsDecrementIntervalMs: 167_000, // 2m47s
  countdownDurationMs: 15 * 60 * 1000, // 15 minutos rolando
  countdownStorageKey: "lp:urgente:deadline:15m",
  price: "R$ 89,90",
  priceCrossed: "R$ 199,90",
  monthlyEquivalent: "R$ 7,49",
};

function track(event: string, payload: Record<string, unknown> = {}) {
  try {
    (window as any).dataLayer?.push({ event, plan: "launch", currency: "BRL", ...payload });
  } catch {
    /* noop */
  }
}

function CTA({ label, className = "" }: { label?: string; className?: string }) {
  const { expired } = useOfferStatus();
  if (expired) {
    return (
      <Button
        type="button"
        disabled
        className={
          "h-14 sm:h-16 px-6 sm:px-9 rounded-2xl text-base sm:text-lg font-extrabold bg-slate-400 text-white cursor-not-allowed opacity-70 " +
          className
        }
      >
        Oferta encerrada
      </Button>
    );
  }
  return (
    <Button
      type="button"
      onClick={() => {
        track("click_urgente_cta", { label });
        openLaunchCheckout();
      }}
      className={
        "h-14 sm:h-16 px-6 sm:px-9 rounded-2xl text-base sm:text-lg font-extrabold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white shadow-[0_20px_50px_-15px_hsl(186_100%_32%/0.7)] transition-transform hover:-translate-y-0.5 " +
        className
      }
    >
      {label ?? "QUERO GARANTIR MINHA VAGA AGORA"}
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );
}

function HeaderCta() {
  const { expired } = useOfferStatus();
  if (expired) {
    return (
      <Button
        type="button"
        size="sm"
        disabled
        className="bg-slate-400 text-white font-bold rounded-xl text-xs sm:text-sm cursor-not-allowed opacity-70"
      >
        Encerrada
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => {
        track("click_urgente_cta", { label: "header" });
        openLaunchCheckout();
      }}
      className="bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-bold rounded-xl shadow-md text-xs sm:text-sm"
    >
      Garantir vaga
    </Button>
  );
}

function StickyMobileCta({ price }: { price: string }) {
  const { expired } = useOfferStatus();
  if (expired) {
    return (
      <Button
        type="button"
        disabled
        className="w-full h-12 rounded-xl font-extrabold bg-slate-400 text-white cursor-not-allowed opacity-80"
      >
        OFERTA ENCERRADA
      </Button>
    );
  }
  return (
    <Button
      type="button"
      onClick={() => {
        track("click_urgente_cta", { label: "sticky-mobile" });
        openLaunchCheckout();
      }}
      className="w-full h-12 rounded-xl font-extrabold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white shadow-md"
    >
      GARANTIR POR {price} <ArrowRight className="ml-1 h-4 w-4" />
    </Button>
  );
}

function LaunchOfferBlock() {
  const { expired } = useOfferStatus();
  return (
    <div className="relative">
      <div className={expired ? "pointer-events-none opacity-50 grayscale" : ""} aria-hidden={expired}>
        <LaunchOffer />
      </div>
      {expired && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="rounded-2xl bg-slate-900/90 text-white px-6 py-4 text-center shadow-2xl border border-white/10 max-w-sm">
            <p className="text-sm uppercase tracking-widest font-bold text-red-300">Oferta encerrada</p>
            <p className="mt-2 text-sm text-slate-200">O lote de lançamento por R$ 89,90 acabou. Veja os planos atuais.</p>
            <a
              href="/#planos"
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#00FFFF] hover:underline"
            >
              Ver planos <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LpAnuncioUrgente() {
  return (
    <OfferStatusProvider
      storageKey={CONFIG.countdownStorageKey}
      durationMs={CONFIG.countdownDurationMs}
      onExpire={() => track("urgente_offer_expired")}
    >
      <LpAnuncioUrgenteContent />
    </OfferStatusProvider>
  );
}

function LpAnuncioUrgenteContent() {
  const { expired } = useOfferStatus();
  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Última chamada — Mr Flow Welcome Hub 1 ano por R$ 89,90",
        url: "https://hub.mrflow.com.br/oferta",
        inLanguage: "pt-BR",
      },
    ],
    [],
  );

  useEffect(() => {
    track("view_urgente_page");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-slate-900 pb-24 md:pb-0">
      <Seo
        title="Última chamada: 1 ano de Welcome Hub por R$ 89,90 — enquanto durarem as vagas"
        description="Vagas limitadas ao lote de lançamento. Ative seu guia digital em 5 minutos e pare de perder tempo, avaliações e sono respondendo hóspedes no WhatsApp."
        path="/oferta"
        jsonLd={jsonLd}
      />

      {/* ============ TOPBAR URGÊNCIA (fixa) ============ */}
      <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white">
        <div className="container max-w-6xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <Flame className="h-4 w-4 animate-pulse" /> Oferta expira em
          </div>
          <UrgencyCountdown
            durationMs={CONFIG.countdownDurationMs}
            storageKey={CONFIG.countdownStorageKey}
            className="inline-flex items-center gap-2 sm:gap-3"
            compact
            stopOnZero
            labelClassName="text-[9px] uppercase tracking-widest text-white/70 mt-0.5"
          />
        </div>
      </div>

      {/* ============ HEADER MINIMAL ============ */}
      <header className="w-full bg-[#FAFAF7]/95 backdrop-blur border-b border-slate-200/70">
        <div className="container max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex flex-col items-start leading-none">
            <img
              src={mrFlowLogo}
              alt="Mr Flow Welcome Hub"
              width={140}
              height={32}
              loading="eager"
              decoding="async"
              className="h-7 sm:h-8 w-auto"
            />
            <span className="mt-1 text-[9px] tracking-[0.25em] text-slate-500 uppercase">
              Welcome Hub
            </span>
          </Link>
          <HeaderCta />
        </div>
      </header>

      {/* ============ 1. HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAF7] to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,hsl(186_100%_90%/0.5),transparent_70%)]"
        />
        <div className="container max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-14 sm:pt-14 sm:pb-20 text-center relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-red-700 mb-5">
              <Flame className="h-3.5 w-3.5" /> Última chance — lote de lançamento
            </div>

            <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Enquanto você pensa,{" "}
              <span className="text-[hsl(186_100%_28%)] whitespace-nowrap">outro anfitrião</span>
              <br className="hidden sm:block" /> está garantindo{" "}
              <span className="relative inline-block">
                <span className="relative z-10">a vaga que era sua.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-3 bg-[#00FFFF]/70 -z-0 rounded-sm"
                />
              </span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Você viu como o Welcome Hub funciona. Agora escolhe: continuar respondendo Wi-Fi no WhatsApp
              todo santo dia — <strong>ou ativar seu guia digital em 5 minutos</strong> pagando{" "}
              <strong>{CONFIG.monthlyEquivalent}/mês</strong> por 1 ano inteiro.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 flex flex-col items-center gap-4">
              <SpotsRemaining
                total={CONFIG.totalSpots}
                initialRemaining={CONFIG.initialRemaining}
                decrementIntervalMs={CONFIG.spotsDecrementIntervalMs}
              />
              <CTA />
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Garantia de 7 dias
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" /> Ativação em 5 min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Cancele quando quiser
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[denizeAvatar.url, julianaAvatar.url, pabloAvatar.url].map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  <strong>+2.400 anfitriões</strong> já criaram o guia deles
                </span>
              </div>
              <ActivityTicker />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 3. LOGOS PARCEIROS ============ */}
      <TrustLogos title="Funciona com quem você já usa" />


      {/* ============ 5. ANTES x DEPOIS ============ */}
      <section className="py-16 sm:py-20 bg-slate-50/60">
        <div className="container max-w-5xl mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 tracking-tight mb-3">
              Duas rotinas. Uma escolha.
            </h2>
            <p className="text-center text-slate-600 max-w-xl mx-auto mb-10">
              Uma delas continua te custando fins de semana, avaliações e paciência. A outra custa {CONFIG.monthlyEquivalent}/mês.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            <Reveal delay={80}>
              <Card className="p-6 sm:p-7 rounded-2xl border-2 border-rose-200 bg-rose-50/60">
                <div className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wider mb-4">
                  <X className="h-4 w-4" /> Sem Welcome Hub
                </div>
                <ul className="space-y-3 text-[15px] text-slate-800">
                  {[
                    "Você digita a mesma senha do Wi-Fi 40 vezes por mês.",
                    "Hóspede te liga meia-noite perguntando onde é a chave.",
                    "Avaliação 4 estrelas por “dificuldade no check-in”.",
                    "Sábado à noite = celular na mão respondendo mensagem.",
                    "Impressão amadora, cliente pensa: “não volto mais”.",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <X className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
            <Reveal delay={160}>
              <Card className="p-6 sm:p-7 rounded-2xl border-2 border-[hsl(186_100%_32%)]/40 bg-white">
                <div className="inline-flex items-center gap-2 text-[hsl(186_100%_24%)] font-bold text-sm uppercase tracking-wider mb-4">
                  <Check className="h-4 w-4" /> Com Welcome Hub
                </div>
                <ul className="space-y-3 text-[15px] text-slate-800">
                  {[
                    "Um único link bonito, agendado, chega antes do hóspede.",
                    "Wi-Fi, chave, regras e dicas no celular dele — sem você.",
                    "Avaliações 5 estrelas por “tudo super organizado”.",
                    "Seu fim de semana volta a ser seu fim de semana.",
                    "Aparência de operação profissional, cliente indica.",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 6. DEMO REAL ============ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[hsl(186_100%_24%)] mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Veja funcionando de verdade
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Isso aqui pode estar no bolso do seu hóspede ainda hoje.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <VideoCriacao />
          </Reveal>
        </div>
      </section>

      {/* ============ 7. DEPOIMENTOS ============ */}
      <section className="py-16 sm:py-20 bg-slate-50/60">
        <div className="container max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Eles decidiram antes de você. E não voltaram atrás.
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                photo: denizeAvatar.url,
                name: "Denize Siqueira",
                meta: "Casa da Dinda • RJ",
                text:
                  "Eu queria só um jantar em paz com meu marido. Hoje eu tenho isso de novo. O link vai sozinho, o hóspede resolve sozinho, eu vivo minha vida.",
              },
              {
                photo: julianaAvatar.url,
                name: "Juliana Medeiros",
                meta: "Paracuru • CE",
                text:
                  "Minhas avaliações 5 estrelas dispararam no mesmo mês. Cliente chega sabendo tudo. Devia ter feito isso 2 anos atrás.",
              },
              {
                photo: pabloAvatar.url,
                name: "Pablo da Costa",
                meta: "Nova Friburgo • RJ",
                text:
                  "Parei de receber ligação de madrugada. Só isso já valeu o ano inteiro. O resto é bônus.",
              },
            ].map((t) => (
              <Reveal key={t.name} delay={80}>
                <Card className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.photo}
                      alt={t.name}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.meta}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-[15px] leading-relaxed italic">"{t.text}"</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8. BÔNUS COM PRAZO ============ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 mb-4">
                <Gift className="h-3.5 w-3.5" /> Bônus que somem quando a oferta expirar
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Além do ano inteiro, você leva:
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                title: "Bônus 1 — 15 templates premium",
                desc: "Design profissional para o seu guia parecer feito por um estúdio. Fora do lote, esses templates ficam bloqueados no plano Pro.",
              },
              {
                title: "Bônus 2 — Logo personalizada da sua marca",
                desc: "Sua identidade visual no guia do hóspede, sem custo extra. Só válido para os 100 primeiros do lote.",
              },
            ].map((b) => (
              <Reveal key={b.title} delay={80}>
                <Card className="p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/50 h-full">
                  <div className="inline-flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-3">
                    <Gift className="h-4 w-4" /> Bônus incluso
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{b.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="text-center text-sm text-slate-600 mt-6 max-w-lg mx-auto">
              <Clock className="inline h-4 w-4 mr-1 text-red-500" />
              Quando o timer chega em 00:00:00, os bônus somem — e o preço volta pra{" "}
              <strong className="text-slate-900">{CONFIG.priceCrossed}</strong>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 9. OFERTA (LaunchOffer real) ============ */}
      <LaunchOffer />

      {/* ============ O que você perde ============ */}
      <section className="py-16 sm:py-20 bg-slate-900 text-slate-100">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300 mb-4">
                <TrendingDown className="h-3.5 w-3.5" /> Custo real de ficar parado
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                O que você perde se fechar essa página agora:
              </h2>
            </div>
          </Reveal>
          <ul className="space-y-4">
            {[
              "A condição de R$ 89,90/ano. Fora do lote, é R$ 199,90 — R$ 110 a mais, todo ano, pra sempre.",
              "Os 15 templates premium e a logo personalizada — só entram no combo do lançamento.",
              "As próximas 30 madrugadas respondendo Wi-Fi no WhatsApp. Multiplique isso por 12 meses.",
              "As avaliações 5 estrelas que seus concorrentes já estão colecionando por causa da experiência que você ainda não entrega.",
              "A sensação simples de abrir o Airbnb na segunda de manhã e ver que ninguém reclamou de nada.",
            ].map((t) => (
              <Reveal key={t} delay={40}>
                <li className="flex gap-3 items-start">
                  <X className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                  <span className="text-[15px] sm:text-base text-slate-200 leading-relaxed">{t}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={200}>
            <div className="mt-10 flex justify-center">
              <CTA label="RECUPERAR MEU TEMPO POR R$ 89,90" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 10. GARANTIA ============ */}
      <GarantiaSection />

      {/* ============ 11. FAQ curto ============ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 tracking-tight mb-10">
              Suas últimas dúvidas antes de garantir:
            </h2>
          </Reveal>
          <div className="space-y-4">
            {[
              {
                q: "E se eu não gostar?",
                a: "Você tem 7 dias de garantia total. Pediu reembolso, devolvemos 100% sem burocracia. O risco é todo nosso.",
              },
              {
                q: "Funciona para o meu tipo de imóvel?",
                a: "Se você aluga por temporada — Airbnb, Booking, direto, pousada, chalé, apartamento — funciona. Já são +2.400 anfitriões usando em todo tipo de propriedade.",
              },
              {
                q: "Preciso saber de tecnologia?",
                a: "Não. Você monta seu primeiro guia em menos de 5 minutos, guiado passo a passo. Se souber usar WhatsApp, sabe usar o Welcome Hub.",
              },
              {
                q: "O que acontece quando a oferta expira?",
                a: "O preço volta pra R$ 199,90/ano e os bônus do lançamento (templates premium + logo personalizada) somem. Sem exceção — é limitado a 100 acessos.",
              },
              {
                q: "Renova automaticamente?",
                a: "Sim, renovação anual pelo mesmo valor promocional enquanto você mantiver ativo. Cancela quando quiser pelo painel, sem multa.",
              },
            ].map((f, i) => (
              <Reveal key={i} delay={40}>
                <Card className="p-5 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 mb-1.5">{f.q}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{f.a}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 12. CTA FINAL com countdown ============ */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[hsl(186_100%_18%)] via-[hsl(186_100%_22%)] to-[hsl(186_100%_28%)] text-white">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
              <Flame className="h-3.5 w-3.5" /> Última chamada
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              O timer não espera.
              <br />
              <span className="text-[#00FFFF]">Nem o próximo hóspede.</span>
            </h2>
            <p className="mt-5 text-lg text-white/85 max-w-xl mx-auto">
              Cada minuto que passa é um anfitrião a mais garantindo a vaga que podia ser sua — pelo preço que você
              não vai mais ver depois.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 flex flex-col items-center gap-5">
              <UrgencyCountdown
                durationMs={CONFIG.countdownDurationMs}
                storageKey={CONFIG.countdownStorageKey}
              />
              <SpotsRemaining
                total={CONFIG.totalSpots}
                initialRemaining={CONFIG.initialRemaining}
                decrementIntervalMs={CONFIG.spotsDecrementIntervalMs}
                className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3"
              />
              <CTA label={`GARANTIR MINHA VAGA POR ${CONFIG.price}`} />
              <p className="text-xs text-white/70">
                Pagamento seguro • Garantia de 7 dias • Ativação imediata
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER minimal ============ */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-center text-xs">
        <div className="container max-w-4xl mx-auto px-5">
          <p>© {new Date().getFullYear()} Mr Flow Welcome Hub. Todos os direitos reservados.</p>
          <p className="mt-2 space-x-3">
            <Link to="/termos" className="hover:text-white">Termos</Link>
            <span>·</span>
            <Link to="/privacidade" className="hover:text-white">Privacidade</Link>
          </p>
        </div>
      </footer>

      {/* ============ STICKY MOBILE CTA ============ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] px-4 py-3">
        <Button
          type="button"
          onClick={() => {
            track("click_urgente_cta", { label: "sticky-mobile" });
            openLaunchCheckout();
          }}
          className="w-full h-12 rounded-xl font-extrabold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white shadow-md"
        >
          GARANTIR POR {CONFIG.price} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* ============ EXIT INTENT ============ */}
      <ExitIntentDialog
        onCta={() => {
          track("click_urgente_cta", { label: "exit-intent" });
          openLaunchCheckout();
        }}
      />
    </div>
  );
}
