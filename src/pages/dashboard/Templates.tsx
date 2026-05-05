import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Eye, Loader2, Lock, Sparkles, Wifi, Clock, MapPin, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES, canUseProTemplates, isPreviewReady, type TemplateDef } from "@/lib/templates";
import { TemplatePreviewDialog } from "@/components/templates/TemplatePreviewDialog";

function getContrastText(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#FFFFFF";
}

function mixWithBlackOrWhite(hex: string, amount = 0.12): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Light bg → darken slightly; Dark bg → lighten slightly
  const target = luminance > 0.5 ? 0 : 255;
  const mix = (c: number) => Math.round(c + (target - c) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function MiniPreview({ tpl }: { tpl: TemplateDef }) {
  const ctaText = getContrastText(tpl.primary);
  const bg = tpl.secondary;
  const cardBg = mixWithBlackOrWhite(tpl.secondary, 0.12);
  return (
    <div
      className={`guide-template-${tpl.key} relative overflow-hidden rounded-xl h-56 sm:h-64 border`}
      style={{ background: bg }}
    >
      {/* Faux hero */}
      <div className="h-1/2 w-full" style={{ background: tpl.preview }} />
      <div className="px-3 -mt-6 relative">
        <div className="text-center">
          <div
            className="inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"
            style={{ background: tpl.primary, color: ctaText }}
          >
            Reservar
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {[Clock, KeyRound, Wifi, MapPin, Wifi, Clock].map((Icon, i) => (
            <div
              key={i}
              className="aspect-square rounded-md grid place-items-center"
              style={{ background: cardBg, borderRadius: "var(--guide-radius)" }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: tpl.primary }} />
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur"
        style={{
          background: "rgba(255,255,255,0.9)",
          color: "#111111",
          fontFamily: "var(--guide-heading-font)",
        }}
      >
        {tpl.name}
      </div>
    </div>
  );
}

export default function Templates() {
  const { data: tenant, refetch } = useTenant();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<TemplateDef | null>(null);
  const [previewing, setPreviewing] = useState<TemplateDef | null>(null);

  const isPro = useMemo(() => canUseProTemplates(tenant?.plan_code), [tenant?.plan_code]);
  const currentKey = tenant?.template;

  const apply = useMutation({
    mutationFn: async (tpl: TemplateDef) => {
      if (!tenant) return;
      const { error } = await supabase
        .from("tenants")
        .update({
          template: tpl.key as any,
          primary_color: tpl.primary,
          secondary_color: tpl.secondary,
        })
        .eq("id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template aplicado!");
      qc.invalidateQueries({ queryKey: ["tenant"] });
      refetch();
      setSelected(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleClick = (tpl: TemplateDef) => {
    if (tpl.tier === "pro" && !isPro) return;
    setSelected(tpl);
  };

  if (!tenant) {
    return <div className="container py-12 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const grouped = {
    free: TEMPLATES.filter((t) => t.tier === "free"),
    pro: TEMPLATES.filter((t) => t.tier === "pro"),
  };

  return (
    <div className="container py-8 max-w-6xl space-y-8 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
            Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Escolha um visual pré-definido para o guia do hóspede. As cores, fontes e estilo dos cards mudam — sua logo, capas e conteúdo continuam intactos.
          </p>
        </div>
        {!isPro && (
          <Button asChild>
            <Link to="/app/billing">
              <Sparkles className="h-4 w-4 mr-2" />
              Fazer upgrade para Pro ou Business
            </Link>
          </Button>
        )}
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Básicos</h2>
          <Badge variant="secondary">Grátis</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grouped.free.map((tpl) => (
            <TemplateCard
              key={tpl.key}
              tpl={tpl}
              isCurrent={currentKey === tpl.key}
              locked={false}
              onClick={() => handleClick(tpl)}
              onPreview={() => setPreviewing(tpl)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Biblioteca Premium</h2>
          <Badge className="bg-gradient-to-r from-accent to-primary text-primary-foreground">PRO</Badge>
        </div>
        {!isPro && (
          <Card className="p-4 bg-accent-soft border-accent/30 flex items-start gap-3">
            <Lock className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Templates premium liberados a partir do plano Pro.</p>
              <p className="text-muted-foreground">
                Visualize os modelos abaixo e <Link to="/app/billing" className="underline text-accent-foreground">faça upgrade para Pro ou Business</Link> para aplicar no seu workspace.
              </p>
            </div>
          </Card>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grouped.pro.map((tpl) => (
            <TemplateCard
              key={tpl.key}
              tpl={tpl}
              isCurrent={currentKey === tpl.key}
              locked={!isPro}
              onClick={() => handleClick(tpl)}
              onPreview={() => setPreviewing(tpl)}
            />
          ))}
        </div>
      </section>

      <AlertDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar template "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              As cores, fontes e estilo dos cards do seu guia serão atualizados.
              Sua logo, capas e o conteúdo das páginas continuam exatamente como estão.
              Você pode trocar de template a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selected) apply.mutate(selected);
              }}
              disabled={apply.isPending}
            >
              {apply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TemplatePreviewDialog
        template={previewing}
        open={!!previewing}
        onOpenChange={(o) => !o && setPreviewing(null)}
      />
    </div>
  );
}

function TemplateCard({
  tpl, isCurrent, locked, onClick, onPreview,
}: {
  tpl: TemplateDef;
  isCurrent: boolean;
  locked: boolean;
  onClick: () => void;
  onPreview: () => void;
}) {
  const previewReady = isPreviewReady(tpl.key);
  return (
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      onClick={() => { if (!locked) onClick(); }}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
      aria-disabled={locked}
      className={`group relative text-left rounded-2xl border-2 p-3 transition-all bg-card ${
        isCurrent ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/40"
      } ${locked ? "cursor-not-allowed opacity-95" : "cursor-pointer hover:shadow-card-hover"}`}
    >
      <div className="relative">
        <MiniPreview tpl={tpl} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (previewReady) onPreview(); }}
          disabled={!previewReady}
          title={previewReady ? "Ver prévia em tela cheia" : "Prévia em breve"}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-background/90 backdrop-blur border border-border shadow-sm hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="h-3 w-3" />
          Ver
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{tpl.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</div>
        </div>
        {isCurrent && (
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Check className="h-3 w-3" /> Aplicado
          </Badge>
        )}
      </div>

      {locked && (
        <div className="absolute inset-0 rounded-2xl bg-background/70 backdrop-blur-[2px] grid place-items-center">
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="h-9 w-9 rounded-full bg-card border grid place-items-center shadow">
              <Lock className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="text-xs font-medium">Disponível no plano Pro</div>
          </div>
        </div>
      )}
    </div>
  );
}
