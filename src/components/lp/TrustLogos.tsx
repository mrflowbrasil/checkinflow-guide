import airbnbLogo from "@/assets/lp/logos/airbnb.webp.asset.json";
import bookingLogo from "@/assets/lp/logos/booking.webp.asset.json";
import tripadvisorLogo from "@/assets/lp/logos/tripadvisor.webp.asset.json";
import vrboLogo from "@/assets/lp/logos/vrbo.webp.asset.json";
import staysLogo from "@/assets/lp/logos/stays.webp.asset.json";
import hostawayLogo from "@/assets/lp/logos/hostaway.webp.asset.json";
import omnibeesLogo from "@/assets/lp/logos/omnibees.webp.asset.json";
import hospedinLogo from "@/assets/lp/logos/hospedin.webp.asset.json";

interface Props {
  title?: string;
}

export default function TrustLogos({
  title = "O complemento perfeito para anfitriões de destaque no:",
}: Props) {
  const logos = [
    { name: "Airbnb", src: airbnbLogo.url },
    { name: "Booking.com", src: bookingLogo.url },
    { name: "Tripadvisor", src: tripadvisorLogo.url },
    { name: "Vrbo", src: vrboLogo.url },
    { name: "Stays", src: staysLogo.url },
    { name: "Hostaway", src: hostawayLogo.url },
    { name: "Omnibees", src: omnibeesLogo.url },
    { name: "Hospedin", src: hospedinLogo.url },
  ];
  const track = [...logos, ...logos];

  return (
    <section className="py-8 lg:py-10 bg-gray-50/80 border-y border-slate-200/60 overflow-hidden">
      <style>{`
        @keyframes mrflow-logos-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .mrflow-logos-track {
          animation: mrflow-logos-scroll 40s linear infinite;
        }
        .mrflow-logos-mask {
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
      `}</style>

      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-slate-500 mb-6">
          {title}
        </p>
      </div>

      <div className="mrflow-logos-mask">
        <div className="mrflow-logos-track flex w-max items-center gap-8 lg:gap-12 hover:[animation-play-state:paused]">
          {track.map((logo, i) => (
            <img
              key={`${logo.name}-${i}`}
              src={logo.src}
              alt={logo.name}
              loading="lazy"
              decoding="async"
              width={96}
              height={96}
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity duration-200 shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
