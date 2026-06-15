import { useState } from "react";
import { MoreVertical, Pencil, Power, Trash2, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CatalogProperty } from "@/pages/dashboard/Catalog";

type Props = {
  property: CatalogProperty;
  onEdit: () => void;
  onChanged: () => void;
};

const SOURCE_LABEL: Record<CatalogProperty["source"], string> = {
  manual: "Manual",
  stays: "Stays",
  hub: "Hub",
};

export function PropertyCatalogCard({ property, onEdit, onChanged }: Props) {
  const [busy, setBusy] = useState(false);

  const toggleStatus = async () => {
    setBusy(true);
    const next = property.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("properties").update({ status: next }).eq("id", property.id);
    setBusy(false);
    if (error) return toast.error("Não foi possível atualizar.");
    toast.success(next === "active" ? "Imóvel ativado." : "Imóvel ocultado do catálogo.");
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Remover "${property.name}" do catálogo? Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    const { error } = await supabase.from("properties").delete().eq("id", property.id);
    setBusy(false);
    if (error) return toast.error("Não foi possível remover.");
    toast.success("Imóvel removido.");
    onChanged();
  };

  return (
    <Card className="overflow-hidden flex h-full flex-col">
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4 / 3" }}>
        {property.cover_image_url ? (
          <img
            src={property.cover_image_url}
            alt={property.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sem foto
          </div>
        )}
        <Badge variant="secondary" className="absolute left-2 top-2">
          {SOURCE_LABEL[property.source]}
        </Badge>
        {property.status === "inactive" && (
          <Badge variant="destructive" className="absolute right-2 top-2">Oculto</Badge>
        )}
      </div>
      <CardContent className="pt-4 space-y-2 flex-1">
        <h3 className="font-semibold leading-tight line-clamp-2">{property.name}</h3>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.city && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{property.city}</span>
          )}
          {property.max_guests && (
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{property.max_guests}</span>
          )}
        </div>
        {property.base_price != null && (
          <p className="text-sm font-medium">
            R$ {Number(property.base_price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })} <span className="text-muted-foreground font-normal">/ noite</span>
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="outline" size="sm" onClick={onEdit} disabled={busy}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={busy}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleStatus}>
              <Power className="h-4 w-4 mr-2" />
              {property.status === "active" ? "Ocultar do catálogo" : "Ativar no catálogo"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={remove} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
