import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import teaserVideo from "@/assets/primeiro-imovel.mp4.asset.json";

const CYAN = "hsl(186 100% 32%)";
const YOUTUBE_URL = "https://youtu.be/l8SxORuMqLU";
const VIDEO_SRC = teaserVideo.url;

const bullets = [
  "Cadastre o imóvel com nome, fotos e informações principais",
  "Adicione páginas como Wi-Fi, check-in, regras e localização",
  "Veja a prévia como o hóspede vai acessar no celular",
  "Publique e compartilhe por link ou QR Code",
  "Atualize tudo depois, sem reenviar manual ou PDF",
];

export default function VideoCriacao() {
  return (
    <section className="bg-[#FAFAF7]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 sm:p-10 lg:p-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Coluna esquerda */}
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "hsl(186 100% 32% / 0.1)", color: CYAN }}
              >
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

              <ul className="mt-7 space-y-3">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "hsl(186 100% 32% / 0.12)" }}
                    >
                      <Check className="h-4 w-4" style={{ color: CYAN }} />
                    </span>
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base transition-colors"
                >
                  Criar meu guia grátis
                </Link>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-14 px-7 rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5 font-semibold text-base transition-colors"
                >
                  Ver vídeo completo
                </a>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Sem cartão. Sem instalação. Seu hóspede acessa pelo navegador.
              </p>
            </div>

            {/* Coluna direita — Mockup MacBook */}
            <div className="relative">
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
              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="rounded-t-2xl bg-slate-900 p-2 sm:p-3 shadow-2xl ring-1 ring-slate-800">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
                    <video
                      controls
                      playsInline
                      preload="metadata"
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
          </div>
        </div>
      </div>
    </section>
  );
}
