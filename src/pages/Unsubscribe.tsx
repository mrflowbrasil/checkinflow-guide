import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_KEY } },
        );
        const json = await res.json();
        if (res.ok && json.valid) setStatus("valid");
        else if (json.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) setStatus("error");
      else if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-foreground mb-3">Cancelar inscrição</h1>

        {status === "loading" && (
          <p className="text-muted-foreground">Validando seu link…</p>
        )}
        {status === "valid" && (
          <>
            <p className="text-muted-foreground mb-6">
              Confirme que deseja parar de receber emails do Mr Flow Welcome Hub.
            </p>
            <Button onClick={confirm} disabled={submitting} className="w-full">
              {submitting ? "Processando…" : "Confirmar cancelamento"}
            </Button>
          </>
        )}
        {status === "success" && (
          <p className="text-muted-foreground">
            Pronto! Você não receberá mais nossos emails.
          </p>
        )}
        {status === "already" && (
          <p className="text-muted-foreground">
            Este email já foi removido da nossa lista anteriormente.
          </p>
        )}
        {status === "invalid" && (
          <p className="text-muted-foreground">
            Link inválido ou expirado. Se precisar de ajuda, entre em contato com o suporte.
          </p>
        )}
        {status === "error" && (
          <p className="text-destructive">
            Ocorreu um erro. Tente novamente mais tarde.
          </p>
        )}
      </div>
    </main>
  );
}
