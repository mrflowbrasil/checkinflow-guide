import { useEffect, useState } from "react";
import { Download, Share, Plus, MoreVertical, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Platform = "ios" | "android" | "desktop" | "other";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh|Windows|Linux/i.test(ua)) return "desktop";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export function InstallAppButton({ primaryColor }: { primaryColor?: string }) {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setDeferred(null);
          return;
        }
      } catch {
        // fall through to dialog
      }
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outline"
        size="lg"
        className="w-full h-12 text-sm font-semibold rounded-2xl mt-3 border-2"
        style={{ borderColor: primaryColor, color: primaryColor }}
      >
        <Download className="mr-2 h-4 w-4" /> Instalar App
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" style={{ color: primaryColor }} />
              Instalar App
            </DialogTitle>
            <DialogDescription>
              Tenha o guia sempre à mão na tela inicial do seu celular.
            </DialogDescription>
          </DialogHeader>

          {platform === "ios" && <IosSteps primaryColor={primaryColor} />}
          {platform === "android" && <AndroidSteps primaryColor={primaryColor} />}
          {(platform === "desktop" || platform === "other") && (
            <DesktopSteps primaryColor={primaryColor} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Step({ n, icon, children, primaryColor }: { n: number; icon?: React.ReactNode; children: React.ReactNode; primaryColor?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 h-7 w-7 rounded-full grid place-items-center text-xs font-bold text-white"
        style={{ background: primaryColor ?? "hsl(var(--primary))" }}
      >
        {n}
      </div>
      <div className="flex-1 text-sm leading-relaxed flex items-center gap-2 flex-wrap pt-0.5">
        {children}
        {icon}
      </div>
    </div>
  );
}

function IosSteps({ primaryColor }: { primaryColor?: string }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        💡 No iPhone/iPad, use o navegador <strong>Safari</strong> para instalar.
      </p>
      <Step n={1} primaryColor={primaryColor} icon={<Share className="h-4 w-4 text-blue-500" />}>
        Toque no ícone de <strong>Compartilhar</strong> na barra inferior do Safari
      </Step>
      <Step n={2} primaryColor={primaryColor}>
        Role e selecione <strong>"Adicionar à Tela de Início"</strong>
        <Plus className="h-4 w-4" />
      </Step>
      <Step n={3} primaryColor={primaryColor} icon={<Check className="h-4 w-4 text-green-600" />}>
        Confirme em <strong>"Adicionar"</strong> no canto superior direito
      </Step>
    </div>
  );
}

function AndroidSteps({ primaryColor }: { primaryColor?: string }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        💡 No Android, use o navegador <strong>Chrome</strong> para a melhor experiência.
      </p>
      <Step n={1} primaryColor={primaryColor} icon={<MoreVertical className="h-4 w-4" />}>
        Toque no menu <strong>(3 pontinhos)</strong> no canto superior direito
      </Step>
      <Step n={2} primaryColor={primaryColor}>
        Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong>
      </Step>
      <Step n={3} primaryColor={primaryColor} icon={<Check className="h-4 w-4 text-green-600" />}>
        Confirme em <strong>"Adicionar"</strong> ou <strong>"Instalar"</strong>
      </Step>
      <p className="text-[11px] text-muted-foreground italic">
        Caso apareça aviso do Play Protect, toque em "Instalar mesmo assim" — é apenas porque o app vem direto do navegador.
      </p>
    </div>
  );
}

function DesktopSteps({ primaryColor }: { primaryColor?: string }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        💡 Para a melhor experiência, abra este link no seu <strong>celular</strong>.
      </p>
      <Step n={1} primaryColor={primaryColor} icon={<Download className="h-4 w-4" />}>
        No Chrome/Edge, clique no ícone de <strong>instalar</strong> na barra de endereços
      </Step>
      <Step n={2} primaryColor={primaryColor}>
        Ou abra o menu e selecione <strong>"Instalar Mr Flow..."</strong>
      </Step>
      <Step n={3} primaryColor={primaryColor} icon={<Check className="h-4 w-4 text-green-600" />}>
        Confirme em <strong>"Instalar"</strong>
      </Step>
    </div>
  );
}
