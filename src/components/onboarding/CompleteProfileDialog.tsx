import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
const COUNTS = ["1", "2-5", "6-10", "11-20", "21-50", "50+"] as const;
const PMS = ["Stays", "Hostaway", "Hospedin", "Omnibees", "Cloudbeds", "Hsystem", "Outros", "Nenhum"] as const;

const schema = z.object({
  state: z.string().length(2, "Selecione um estado"),
  whatsapp: z.string().trim().min(10, "Informe um WhatsApp válido").max(20),
  properties_count: z.enum(COUNTS, { errorMap: () => ({ message: "Selecione uma opção" }) }),
  pms: z.enum(PMS, { errorMap: () => ({ message: "Selecione uma opção" }) }),
  pms_other: z.string().trim().max(80).optional(),
}).refine((d) => d.pms !== "Outros" || (d.pms_other && d.pms_other.length > 1), {
  message: "Informe qual sistema",
  path: ["pms_other"],
});

type FormValues = z.infer<typeof schema>;

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CompleteProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { state: "", whatsapp: "", properties_count: undefined, pms: undefined, pms_other: "" },
  });
  const pms = form.watch("pms");

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("onboarding-submit", {
      body: {
        state: values.state,
        whatsapp: values.whatsapp,
        properties_count: values.properties_count,
        pms: values.pms,
        pms_other: values.pms === "Outros" ? values.pms_other : null,
      },
    });
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar. Tente novamente.");
    toast.success("Perfil completo! Obrigado.");
    qc.invalidateQueries({ queryKey: ["onboarding_status"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete seu cadastro</DialogTitle>
          <DialogDescription>
            Leva menos de 1 minuto e nos ajuda a personalizar sua experiência.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual seu estado?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular (WhatsApp)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={field.value}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      inputMode="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="properties_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantos imóveis você administra?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usa algum sistema (PMS)?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {pms === "Outros" && (
              <FormField
                control={form.control}
                name="pms_other"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual sistema?</FormLabel>
                    <FormControl><Input placeholder="Nome do sistema" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
                Pular por agora
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Concluir
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
