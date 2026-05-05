import { useState } from "react";
import { Calendar, ArrowLeft, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPageIcon } from "@/lib/page-icons";
import type { TemplateDef } from "@/lib/templates";

const FAKE_PAGES = [
  { key: "directions", title: "Como Chegar", icon: "Navigation" },
  { key: "checkin", title: "Check-in", icon: "Clock" },
  { key: "lock", title: "Senha Fechadura", icon: "KeyRound" },
  { key: "wifi", title: "Wi-Fi", icon: "Wifi" },
  { key: "checkout", title: "Check-out", icon: "LogOut" },
  { key: "location", title: "Localização", icon: "MapPin" },
  { key: "rules", title: "Regras", icon: "BookOpen" },
  { key: "tourism", title: "Pontos Turísticos", icon: "Landmark" },
  { key: "food", title: "Onde Comer", icon: "UtensilsCrossed" },
];

import COVER_IMG from "@/assets/preview-cover-vila-serena.jpg";

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
}: {
  template: TemplateDef | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (!template) return null;

  const primary = template.primary;
  const tplClass = `guide-template-${template.key}`;
  const activePage = FAKE_PAGES.find((p) => p.key === activeKey);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setActiveKey(null);
      }}
    >
      <DialogContent className="p-0 max-w-[420px] sm:max-w-[420px] gap-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="text-sm font-medium">Prévia: {template.name}</div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className={`guide-root ${tplClass} h-[78vh] overflow-y-auto`}>
          {!activePage ? (
            <HomePreview template={template} primary={primary} onOpenPage={(k) => setActiveKey(k)} />
          ) : (
            <PagePreview
              title={activePage.title}
              icon={activePage.icon}
              primary={primary}
              onBack={() => setActiveKey(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HomePreview({
  template,
  primary,
  onOpenPage,
}: {
  template: TemplateDef;
  primary: string;
  onOpenPage: (k: string) => void;
}) {
  return (
    <>
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img src={COVER_IMG} alt="Preview" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)" }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-center">
          <h1 className="text-2xl font-semibold drop-shadow-lg">Suíte Premium - Vila Serena</h1>
          <p className="text-xs opacity-90 mt-1 drop-shadow">Campos do Jordão - São Paulo - SP</p>
        </div>
      </div>

      <div className="px-4 -mt-3 relative z-10 pb-8">
        <div className="text-center mt-5 mb-3">
          <h2
            className="text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: primary }}
          >
            Hub de Boas Vindas
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {FAKE_PAGES.map((p) => {
            const Icon = getPageIcon(p.icon);
            return (
              <button
                key={p.key}
                onClick={() => onOpenPage(p.key)}
                className="guide-card aspect-square flex flex-col items-center justify-center gap-2 p-2 transition-all active:scale-95 shadow-sm"
              >
                <Icon className="h-6 w-6" style={{ color: primary }} />
                <span
                  className="text-[11px] font-medium text-center leading-tight"
                  style={{ color: "hsl(var(--guide-fg))" }}
                >
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          className="guide-cta-primary w-full h-12 text-sm font-semibold tracking-wider uppercase rounded-2xl mt-4"
          style={{ background: primary, color: "#fff" }}
        >
          <Calendar className="mr-2 h-4 w-4" /> Reservar Novamente
        </Button>

        <p
          className="mt-6 text-center text-[10px]"
          style={{ color: "hsl(var(--guide-muted))" }}
        >
          Prévia ilustrativa do template <strong>{template.name}</strong>.
        </p>
      </div>
    </>
  );
}

function PagePreview({
  title,
  icon,
  primary,
  onBack,
}: {
  title: string;
  icon: string;
  primary: string;
  onBack: () => void;
}) {
  const Icon = getPageIcon(icon);
  return (
    <div>
      <div
        className="sticky top-0 z-10 px-3 py-3 backdrop-blur"
        style={{
          background: "hsl(var(--guide-bg) / 0.85)",
          borderBottom: "1px solid hsl(var(--guide-fg) / 0.08)",
        }}
      >
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-5 pt-4 pb-12">
        <div className="flex flex-col items-center text-center mb-6">
          <Icon className="h-10 w-10 mb-3" style={{ color: primary }} />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <p className="text-sm mb-4" style={{ color: "hsl(var(--guide-fg))" }}>
          Este é um exemplo de conteúdo desta página. O texto do guia aparece aqui com a
          tipografia e cores do template selecionado.
        </p>

        <div
          className="guide-card p-4 mb-4 border-l-4"
          style={{ borderLeftColor: primary }}
        >
          <p className="text-sm font-medium mb-1">Dica importante</p>
          <p className="text-xs" style={{ color: "hsl(var(--guide-muted))" }}>
            Caixas de dica destacam informações úteis para o hóspede.
          </p>
        </div>

        <ul className="space-y-2 mb-4">
          {["Item de exemplo", "Outro item da lista", "Mais um item"].map((t) => (
            <li
              key={t}
              className="guide-card p-3 text-sm flex items-center gap-2"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: primary }}
              />
              {t}
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          style={{ background: primary, color: "#fff" }}
        >
          Botão de ação
        </Button>
      </div>
    </div>
  );
}
