import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanUsage } from "@/hooks/useTenant";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown, ExternalLink, Loader2, ArrowUpRight, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  unpaid: "Pagamento não realizado",
  incomplete: "Pagamento incompleto",
};

export function SubscriptionCard() {
  const { data: tenant } = useTenant();
  const { data: usage } = usePlanUsage();
  const qc = useQueryClient();
  const [openingPortal, setOpeningPortal] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ["tenant_subscription", tenant?.id],
    enabled: !!tenant,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reactivate: boolean) => {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { environment: getStripeEnvironment(), reactivate },
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message ?? "Erro");
      return data as { ends_at: string | null; cancel_at_period_end: boolean };
    },
    onSuccess: (data) => {
      const date = fmtDate(data.ends_at);
      toast.success(
        data.cancel_at_period_end
          ? date
            ? `Assinatura cancelada. Seu acesso continua até ${date}.`
            : "Assinatura cancelada. Seu acesso continua até o fim do período pago."
          : "Assinatura reativada com sucesso.",
      );
      qc.invalidateQueries({ queryKey: ["tenant_subscription"] });
      qc.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Não foi possível concluir a solicitação"),
  });

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/app/settings`, environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message ?? data?.error ?? "Erro");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message ?? "Não foi possível abrir o portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  const activeStatuses = ["active", "trialing", "past_due"];
  const hasPaidSub = !!subscription && activeStatuses.includes(subscription.status as string);
  const scheduledCancel = hasPaidSub && !!subscription?.cancel_at_period_end;
  const periodEnd = fmtDate(subscription?.current_period_end as string | null);
  const trialEnd = fmtDate(tenant?.trial_ends_at);
  const interval = subscription?.billing_interval === "year" ? "Anual" : "Mensal";

  return (
    <Card className="p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-semibold">Assinatura</h2>
        </div>
        {hasPaidSub && (
          <Badge variant={scheduledCancel ? "secondary" : "default"}>
            {scheduledCancel ? "Cancelamento agendado" : STATUS_LABEL[subscription!.status as string] ?? "Ativa"}
          </Badge>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
        <div className="text-sm text-muted-foreground">Plano atual</div>
        <div className="font-semibold capitalize">
          {usage?.plan?.name ?? tenant?.plan_code ?? "—"}
          {usage && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              · {usage.used}/{usage.unlimited ? "∞" : usage.limit} imóveis
            </span>
          )}
        </div>
        {hasPaidSub ? (
          <div className="text-xs text-muted-foreground pt-1">
            Ciclo {interval.toLowerCase()}
            {periodEnd &&
              (scheduledCancel
                ? ` · acesso garantido até ${periodEnd}`
                : ` · próxima cobrança em ${periodEnd}`)}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground pt-1">
            {tenant?.trial_status === "active" && trialEnd
              ? `Período de teste até ${trialEnd}`
              : "Nenhuma assinatura paga ativa."}
          </div>
        )}
      </div>

      {scheduledCancel && (
        <div className="rounded-md border border-accent/30 bg-accent-soft p-3 text-sm">
          Sua assinatura foi cancelada e não será renovada. Você mantém todos os recursos do plano
          {periodEnd ? ` até ${periodEnd}` : " até o fim do período já pago"}.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="default" size="sm">
          <Link to="/app/billing">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            {hasPaidSub ? "Ver planos / fazer upgrade" : "Ver planos"}
          </Link>
        </Button>

        {subscription?.stripe_customer_id && (
          <Button variant="outline" size="sm" onClick={openPortal} disabled={openingPortal}>
            {openingPortal ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Gerenciar pagamento
          </Button>
        )}

        {hasPaidSub && !scheduledCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmCancel(true)}
            disabled={cancelMutation.isPending}
          >
            <XCircle className="h-4 w-4 mr-2" /> Cancelar assinatura
          </Button>
        )}

        {scheduledCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => cancelMutation.mutate(true)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Reativar assinatura
          </Button>
        )}
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              O cancelamento é agendado para o fim do período já pago. Você continua com todos os
              recursos do seu plano{periodEnd ? ` até ${periodEnd}` : " até o fim do ciclo atual"} e
              pode reativar quando quiser antes dessa data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelMutation.mutate(false)}>
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default SubscriptionCard;
