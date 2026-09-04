import { ArrowDownUp, ChevronDown, ChevronUp, Loader2, Search, SlidersHorizontal } from "lucide-react";

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
  maxPrice: number | null;
  city: string | null;
};

export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "guests_desc"
  | "guests_asc"
  | "name_asc"
  | "name_desc";

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  priceMax: number;
  onSearch: () => void;
  searching: boolean;
  hasLiveAvailability: boolean;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  cities: string[];
  resultLabel?: string;
  resultLabelPlural?: string;
};

export function CatalogFilters({
  filters,
  onChange,
  priceMax,
  onSearch,
  searching,
  hasLiveAvailability,
  sort,
  onSortChange,
  totalResults,
  cities,
  resultLabel = "acomodação",
  resultLabelPlural = "acomodações",
}: Props) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="sticky top-2 z-10 rounded-xl border bg-background/95 backdrop-blur p-3 sm:p-4 shadow-sm space-y-3">
      <div
        className={`grid gap-2 sm:gap-3 ${
          hasLiveAvailability
            ? "grid-cols-2 sm:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {hasLiveAvailability && (
          <>
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
          </>
        )}

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
          <Select
            value={filters.city ?? "any"}
            onValueChange={(v) => update({ city: v === "any" ? null : v })}
          >
            <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label>Preço máx.</Label>
            <span className="text-muted-foreground">
              {filters.maxPrice ? `R$ ${filters.maxPrice.toLocaleString("pt-BR")}` : "Qualquer"}
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
      </div>

      {hasLiveAvailability && (
        <Button className="w-full sm:w-auto sm:ml-auto sm:flex" onClick={onSearch} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Buscar disponibilidade
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalResults}</span>{" "}
          {totalResults === 1 ? resultLabel : resultLabelPlural} encontrada{totalResults === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
              <SelectItem value="guests_desc">Maior capacidade</SelectItem>
              <SelectItem value="guests_asc">Menor capacidade</SelectItem>
              <SelectItem value="name_asc">Nome A-Z</SelectItem>
              <SelectItem value="name_desc">Nome Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
