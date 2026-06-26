import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { sbImage } from "@/lib/supabase-image";

type Props = {
  coverUrl: string | null;
  propertyName: string;
  passwordRequired: boolean;
  expectedPassword: string | null;
  onUnlock: () => void;
};

const NO_PASS_AUTOCLOSE_MS = 1800;

export function GuestIntroSplash({
  coverUrl,
  propertyName,
  passwordRequired,
  expectedPassword,
  onUnlock,
}: Props) {
  const [closing, setClosing] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const closedRef = useRef(false);

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    setClosing(true);
    setTimeout(onUnlock, 320);
  };

  // Auto-close when no password is required
  useEffect(() => {
    if (passwordRequired) return;
    const t = setTimeout(close, NO_PASS_AUTOCLOSE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordRequired]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok =
      (expectedPassword ?? "").trim().toLowerCase() ===
      password.trim().toLowerCase();
    if (!ok) {
      setError("Senha incorreta. Tente novamente.");
      return;
    }
    setError(null);
    close();
  };

  const bg = coverUrl ? sbImage(coverUrl, { width: 1280 }) : null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black ${
        closing ? "intro-splash-leave" : ""
      }`}
      role="dialog"
      aria-label="Boas-vindas"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap');

        @keyframes intro-zoom {
          from { transform: scale(1.12); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes intro-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes intro-hand-write {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
        @keyframes intro-leave {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .intro-bg {
          animation: intro-zoom 1800ms cubic-bezier(.2,.7,.2,1) both;
        }
        .intro-headline {
          font-family: 'Caveat', 'Brush Script MT', cursive;
          animation: intro-hand-write 1100ms cubic-bezier(.6,.05,.25,1) 350ms both;
        }
        .intro-form {
          animation: intro-fade-up 420ms ease-out 1300ms both;
        }
        .intro-splash-leave {
          animation: intro-leave 300ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-bg, .intro-headline, .intro-form { animation: none !important; }
          .intro-headline { clip-path: inset(0 0 0 0); }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 intro-bg">
        {bg ? (
          <img
            src={bg}
            alt={propertyName}
            className="h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-700" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.8) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center text-white">
        <h1
          className="intro-headline text-6xl sm:text-7xl font-bold drop-shadow-2xl leading-none"
          style={{ color: "#fff" }}
        >
          Seja bem-vindo!
        </h1>

        {passwordRequired ? (
          <form
            onSubmit={handleSubmit}
            className="intro-form mt-8 w-full max-w-xs flex flex-col gap-3"
          >
            <label className="text-sm opacity-90 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Digite a senha de acesso
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className="h-12 rounded-xl px-4 text-center text-base bg-white/95 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••"
              autoComplete="off"
            />
            {error && (
              <p className="text-xs text-red-200 bg-red-900/40 rounded-md py-1.5 px-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="h-12 rounded-xl bg-white text-slate-900 font-semibold text-sm tracking-wide hover:bg-white/90 active:scale-[0.98] transition"
            >
              Entrar
            </button>
          </form>
        ) : (
          <div className="mt-8 opacity-70">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
