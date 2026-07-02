import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight } from "lucide-react";

interface Props {
  onCta: () => void;
}

export default function ExitIntentDialog({ onCta }: Props) {
  const [open, setOpen] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("lp:urgente:exit-shown")) return;

    const handleMouseOut = (e: MouseEvent) => {
      if (fired) return;
      if (e.clientY <= 0 && !e.relatedTarget) {
        setFired(true);
        setOpen(true);
        window.sessionStorage.setItem("lp:urgente:exit-shown", "1");
      }
    };

    // Mobile fallback: back-button/scroll-up hijack
    const timer = window.setTimeout(() => {
      if (!fired && window.innerWidth < 768) {
        setFired(true);
        setOpen(true);
        window.sessionStorage.setItem("lp:urgente:exit-shown", "1");
      }
    }, 45000);

    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.clearTimeout(timer);
    };
  }, [fired]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-2 border-orange-300">
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-6 py-5 text-center text-white">
          <Flame className="mx-auto h-8 w-8 mb-2" />
          <h3 className="text-xl font-extrabold leading-tight">Espera! Você vai mesmo sair sem garantir a sua vaga?</h3>
        </div>
        <div className="p-6 text-center space-y-4">
          <p className="text-slate-700 text-[15px]">
            As <strong>vagas de R$ 89,90/ano</strong> estão acabando em tempo real. Quando o lote encerrar, o valor volta
            pra <strong className="line-through">R$ 199,90</strong> — e não tem exceção.
          </p>
          <p className="text-sm text-slate-500">
            Você levou meses pra montar seu imóvel. Não deixa a experiência do seu hóspede de fora por 30 segundos de indecisão.
          </p>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
              onCta();
            }}
            className="w-full h-12 rounded-xl text-base font-bold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white"
          >
            SIM, QUERO GARANTIR AGORA <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <button
            type="button"
            className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
            onClick={() => setOpen(false)}
          >
            Não, prefiro voltar depois pagando mais caro
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
