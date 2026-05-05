import React from "react";

// 👉 Para trocar as imagens, basta editar este array (ou passar a prop `images`).
const DEFAULT_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=1200&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1673264933212-d78737f38e48?q=80&w=1200&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1711434824963-ca894373272e?q=80&w=1200&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1675705721263-0bbeec261c49?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524799526615-766a9833dec0?q=80&w=1200&auto=format&fit=crop",
];

export interface ImageAutoSliderProps {
  images?: string[];
  /** Duração de um ciclo completo em segundos. Padrão: 30s */
  durationSeconds?: number;
}

export const ImageAutoSlider: React.FC<ImageAutoSliderProps> = ({
  images = DEFAULT_IMAGES,
  durationSeconds = 30,
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
