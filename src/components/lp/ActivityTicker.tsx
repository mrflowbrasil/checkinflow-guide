import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const EVENTS = [
  { name: "Mariana", city: "Búzios - RJ", ago: 3 },
  { name: "Rafael", city: "Florianópolis - SC", ago: 7 },
  { name: "Denize", city: "Rio de Janeiro - RJ", ago: 12 },
  { name: "Juliana", city: "Paracuru - CE", ago: 18 },
  { name: "Pablo", city: "Nova Friburgo - RJ", ago: 24 },
  { name: "Camila", city: "Ubatuba - SP", ago: 31 },
  { name: "Ricardo", city: "Gramado - RS", ago: 42 },
  { name: "Fernanda", city: "Porto de Galinhas - PE", ago: 55 },
  { name: "Lucas", city: "Trancoso - BA", ago: 68 },
  { name: "Aline", city: "Campos do Jordão - SP", ago: 82 },
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
        <strong className="font-semibold">{e.name}</strong> de {e.city} garantiu a vaga há {e.ago} min
      </span>
    </div>
  );
}
