import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  scheduled: { label: "Agendada", variant: "default" },
  applied: { label: "Ativa", variant: "secondary" },
  removed: { label: "Expirada", variant: "outline" },
  canceled: { label: "Cancelada", variant: "outline" },
  failed: { label: "Falhou", variant: "destructive" },
};

// 30-minute steps
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function combine(date: Date | undefined, time: string): Date | null {
  if (!date) return null;
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

type Props = { propertyId: string; tenantId: string };

export function LockCodeScheduleCard({ propertyId, tenantId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applyDate, setApplyDate] = useState<Date | undefined>();
  const [applyTime, setApplyTime] = useState("14:00");
  const [removeDate, setRemoveDate] = useState<Date | undefined>();
  const [removeTime, setRemoveTime] = useState("12:00");

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["lock_code_schedules", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_lock_code_schedules")
        .select("*")
        .eq("property_id", propertyId)
        .order("apply_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const reset = () => {
    setCode("");
    setApplyDate(undefined);
    setApplyTime("14:00");
    setRemoveDate(undefined);
    setRemoveTime("12:00");
  };

  const create = useMutation({
    mutationFn: async () => {
      const trimmed = code.trim();
      if (!trimmed) throw new Error("Informe a senha da fechadura.");
      if (trimmed.length > 32) throw new Error("A senha deve ter no máximo 32 caracteres.");
      const applyAt = combine(applyDate, applyTime);
      if (!applyAt) throw new Error("Escolha a data e hora de publicação.");
      const removeAt = combine(removeDate, removeTime);
      if (removeAt && removeAt.getTime() <= applyAt.getTime()) {
        throw new Error("A remoção deve ser depois da publicação.");
      }
      const { error } = await supabase.from("property_lock_code_schedules").insert({
        tenant_id: tenantId,
        property_id: propertyId,
        lock_code: trimmed,
        apply_at: applyAt.toISOString(),
        remove_at: removeAt ? removeAt.toISOString() : null,
        source: "app",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Senha agendada!");
      setOpen(false);
      reset();
      qc.invalidateQueries({ queryKey: ["lock_code_schedules", propertyId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from("property_lock_code_schedules")
        .update({ status: "canceled" })
        .eq("id", scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agendamento cancelado.");
      qc.invalidateQueries({ queryKey: ["lock_code_schedules", propertyId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const quick = (daysAhead: number, time: string) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setApplyDate(d);
    setApplyTime(time);
  };

  return (
    <Card className="p-6 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-accent-foreground" /> Senha da fechadura agendada
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Programe quando a senha entra no guia do hóspede e quando ela deve ser removida.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Agendar senha
        </Button>
      </div>

      {isLoading ? (
        <div className="py-6 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : !schedules?.length ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
          Nenhum agendamento. A senha atual continua sendo a definida na página "Senha Fechadura".
        </p>
      ) : (
        <div className="space-y-2">
          {schedules.map((s: any) => {
            const st = STATUS_LABEL[s.status] ?? { label: s.status, variant: "outline" as const };
            return (
              <div key={s.id} className="rounded-lg border p-3 flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{s.lock_code}</span>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Publica em {fmt(s.apply_at)} · Remove em {fmt(s.remove_at)}
                  </div>
                  {s.last_error && <div className="text-xs text-destructive">{s.last_error}</div>}
                </div>
                {s.status === "scheduled" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancel.mutate(s.id)}
                    disabled={cancel.isPending}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Cancelar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar senha da fechadura</DialogTitle>
            <DialogDescription>
              A senha será publicada automaticamente na data escolhida e removida na data de expiração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lock-code">Senha da fechadura</Label>
              <Input
                id="lock-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={32}
                placeholder="Ex: 4821"
              />
            </div>

            <DateTimeField
              label="Publicar em"
              date={applyDate}
              time={applyTime}
              onDate={setApplyDate}
              onTime={setApplyTime}
            />
            <div className="flex gap-2 -mt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => quick(0, "14:00")}>Hoje 14:00</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => quick(1, "14:00")}>Amanhã 14:00</Button>
            </div>

            <DateTimeField
              label="Remover em (opcional)"
              date={removeDate}
              time={removeTime}
              onDate={setRemoveDate}
              onTime={setRemoveTime}
              onClear={() => setRemoveDate(undefined)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DateTimeField({
  label, date, time, onDate, onTime, onClear,
}: {
  label: string;
  date: Date | undefined;
  time: string;
  onDate: (d: Date | undefined) => void;
  onTime: (t: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {onClear && date && (
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("flex-1 justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Escolher data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDate}
              initialFocus
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Select value={time} onValueChange={onTime}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {TIME_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
