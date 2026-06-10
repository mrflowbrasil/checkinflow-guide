import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type Filters = {
  checkin: string | null;
  checkout: string | null;
  guests: number | null;
  city: string;
  maxPrice: number | null;
};

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  cities: string[];
  priceMax: number;
  onSearch: () => void;
  searching: boolean;
};

export function CatalogFilters({ filters, onChange, cities, priceMax, onSearch, searching }: Props) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="sticky top-2 z-10 rounded-xl border bg-background/95 backdrop-blur p-3 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="checkin" className="text-xs">Check-in</Label>
          <Input
            id="checkin"
            type="date"
            value={filters.checkin ?? ""}
            onChange={(e) => update({ checkin: e.target.value || null })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="checkout" className="text-xs">Check-out</Label>
          <Input
            id="checkout"
            type="date"
            value={filters.checkout ?? ""}
            onChange={(e) => update({ checkout: e.target.value || null })}
            min={filters.checkin ?? undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Hóspedes</Label>
          <Select
            value={filters.guests ? String(filters.guests) : "any"}
            onValueChange={(v) => update({ guests: v === "any" ? null : Number(v) })}
          >
            <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>{n === 5 ? "5+" : n} hóspede{n > 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cidade</Label>
          {cities.length > 0 ? (
            <Select
              value={filters.city || "any"}
              onValueChange={(v) => update({ city: v === "any" ? "" : v })}
            >
              <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Todas</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={filters.city} onChange={(e) => update({ city: e.target.value })} placeholder="Cidade" />
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <Label>Preço máximo / noite</Label>
          <span className="text-muted-foreground">
            {filters.maxPrice ? `Até R$ ${filters.maxPrice.toLocaleString("pt-BR")}` : "Qualquer"}
          </span>
        </div>
        <Slider
          min={0}
          max={priceMax}
          step={50}
          value={[filters.maxPrice ?? priceMax]}
          onValueChange={(v) => update({ maxPrice: v[0] >= priceMax ? null : v[0] })}
        />
      </div>

      <Button className="w-full" onClick={onSearch} disabled={searching}>
        {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
        Buscar disponibilidade
      </Button>
    </div>
  );
}
