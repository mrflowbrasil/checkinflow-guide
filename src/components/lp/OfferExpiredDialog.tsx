import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { useOfferStatus } from "@/hooks/useOfferDeadline";

interface Props {
  onCtaTrack?: (target: "planos" | "home") => void;
  onOpenTrack?: () => void;
}

export default function OfferExpiredDialog({ onCtaTrack, onOpenTrack }: Props) {
  const { expired } = useOfferStatus();
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (expired && !shownRef.current) {
      shownRef.current = true;
      setOpen(true);
      onOpenTrack?.();
    }
  }, [expired, onOpenTrack]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-slate-300">
        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 px-6 py-6 text-center text-white">
          <Clock className="mx-auto h-9 w-9 mb-2 text-slate-300" />
          <h3 className="text-xl font-extrabold leading-tight">Essa oferta encerrou</h3>
          <p className="mt-1 text-sm text-slate-300">
            O tempo do lote de lançamento acabou.
          </p>
        </div>
        <div className="p-6 text-center space-y-4">
          <p className="text-slate-700 text-[15px] leading-relaxed">
            As <strong>100 vagas por R$ 89,90/ano</strong> não estão mais disponíveis por aqui.
            Você ainda pode conhecer os planos atuais do Welcome Hub e ativar seu guia digital hoje mesmo.
          </p>
          <Button
            asChild
            className="w-full h-12 rounded-xl text-base font-bold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white"
          >
            <a href="/#planos" onClick={() => onCtaTrack?.("planos")}>
              Ver planos disponíveis <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Link
            to="/"
            onClick={() => onCtaTrack?.("home")}
            className="inline-block text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
