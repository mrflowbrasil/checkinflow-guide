import React from "react";
import hub1 from "@/assets/carrossel/hub-1.webp";
import hub2 from "@/assets/carrossel/hub-2.webp";
import hub3 from "@/assets/carrossel/hub-3.webp";
import hub4 from "@/assets/carrossel/hub-4.webp";

// 👉 Para trocar as imagens, basta editar este array (ou passar a prop `images`).
const DEFAULT_IMAGES: string[] = [hub1, hub2, hub3, hub4];

export interface ImageAutoSliderProps {
  images?: string[];
  /** Duração de um ciclo completo em segundos. Padrão: 50s */
  durationSeconds?: number;
}

export const ImageAutoSlider: React.FC<ImageAutoSliderProps> = ({
  images = DEFAULT_IMAGES,
  durationSeconds = 50,
}) => {
  const duplicated = [...images, ...images];

  return (
    <div className="w-full">
      <style>{`
        @keyframes mrflow-scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mrflow-track {
          animation: mrflow-scroll-x ${durationSeconds}s linear infinite;
        }
        .mrflow-mask {
          mask: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .mrflow-img {
          transition: transform 0.4s ease, filter 0.4s ease;
        }
        .mrflow-img:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>

      <div className="mrflow-mask overflow-hidden">
        <div className="mrflow-track flex gap-4 w-max">
          {duplicated.map((src, i) => (
            <div
              key={i}
              className="shrink-0 h-32 sm:h-40 lg:h-48 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="mrflow-img h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageAutoSlider;
