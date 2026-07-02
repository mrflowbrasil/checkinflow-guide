import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const EVENTS = [
  { city: "Búzios - RJ", ago: 3 },
  { city: "Florianópolis - SC", ago: 7 },
  { city: "Rio de Janeiro - RJ", ago: 12 },
  { city: "Paracuru - CE", ago: 18 },
  { city: "Nova Friburgo - RJ", ago: 24 },
  { city: "Ubatuba - SP", ago: 31 },
  { city: "Gramado - RS", ago: 42 },
  { city: "Porto de Galinhas - PE", ago: 55 },
  { city: "Trancoso - BA", ago: 68 },
  { city: "Campos do Jordão - SP", ago: 82 },
];

export default function ActivityTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % EVENTS.length), 4500);
    return () => clearInterval(id);
  }, []);
  const e = EVENTS[i];
  return (
    <div
      key={i}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-800 shadow-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      <span>
        Um anfitrião de <strong className="font-semibold">{e.city}</strong> garantiu a vaga há {e.ago} min
      </span>
    </div>
  );
}
