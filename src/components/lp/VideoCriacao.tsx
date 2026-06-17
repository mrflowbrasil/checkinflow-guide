import { useState } from "react";
import { Link } from "react-router-dom";
import teaserVideo from "@/assets/lp/primeiro-imovel-teaser.mp4.asset.json";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal } from "@/hooks/useReveal";

const CYAN = "hsl(186 100% 32%)";
const YOUTUBE_ID = "l8SxORuMqLU";
const VIDEO_SRC = teaserVideo.url;
const POSTER_SRC: string | undefined = undefined;

export default function VideoCriacao() {
  const [videoOpen, setVideoOpen] = useState(false);
  return (
    <>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
          <div className="bg-white rounded-3xl border border-border shadow-sm p-6 sm:p-10 lg:p-14">
            {/* Topo centralizado */}
            <Reveal className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 text-xs font-semibold tracking-wide uppercase text-[hsl(186_100%_24%)]">
                Demonstração rápida
              </span>

              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                Crie seu primeiro imóvel em menos de 5 minutos
              </h2>

              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Veja como é simples transformar as informações da sua hospedagem em
                um guia digital bonito, organizado e pronto para enviar ao hóspede
                por link ou QR Code.
              </p>
            </div>

            {/* Mockup centralizado */}
            <div className="relative mx-auto w-full max-w-[760px] mb-10 lg:mb-14">
              {/* glow sutil atrás */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 blur-3xl opacity-50"
                style={{
                  background:
                    "radial-gradient(closest-side, hsl(186 100% 32% / 0.25), transparent 70%)",
                }}
              />

              {/* Tampa do notebook */}
              <div className="relative mx-auto w-full max-w-[720px]">
                <div className="rounded-t-2xl bg-slate-900 p-2 sm:p-3 shadow-2xl ring-1 ring-slate-800">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={POSTER_SRC}
                      className="h-full w-full object-cover"
                      src={VIDEO_SRC}
                    />
                  </div>
                </div>

                {/* Base do notebook */}
                <div className="relative mx-auto -mt-px w-[108%] -translate-x-[3.7%]">
                  <div className="h-3 rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-md" />
                  <div className="mx-auto h-1.5 w-24 rounded-b-md bg-slate-400" />
                </div>

                {/* sombra ambiente */}
                <div
                  aria-hidden
                  className="mx-auto mt-3 h-6 w-3/4 rounded-[50%] bg-slate-900/15 blur-xl"
                />
              </div>
            </div>

            {/* Botões centralizados */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base transition-colors"
              >
                Criar meu guia grátis
              </Link>
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center h-14 px-7 rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5 font-semibold text-base transition-colors"
              >
                Ver vídeo completo
              </button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              Sem cartão. Sem instalação. Seu hóspede acessa pelo navegador.
            </p>
          </div>
        </div>
      </section>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
          <DialogTitle className="sr-only">
            Crie seu primeiro imóvel em menos de 5 minutos
          </DialogTitle>
          <div className="aspect-video w-full">
            {videoOpen && (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                title="Crie seu primeiro imóvel em menos de 5 minutos"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
