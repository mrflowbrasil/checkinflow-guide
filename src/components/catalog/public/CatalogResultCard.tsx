import { MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PublicProperty } from "@/pages/PublicCatalog";

export function CatalogResultCard({ property }: { property: PublicProperty }) {
  const handleClick = () => {
    if (property.booking_url) {
      window.open(property.booking_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="relative aspect-[4/3] bg-muted">
        {property.cover_image_url ? (
          <img
            src={property.cover_image_url}
            alt={property.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h2 className="font-semibold leading-tight">{property.name}</h2>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.max_guests && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {property.max_guests} hóspede{property.max_guests > 1 ? "s" : ""}
            </span>
          )}
          {property.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.city}
            </span>
          )}
        </div>
        {property.base_price != null && (
          <p className="text-base font-semibold">
            R$ {Number(property.base_price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}{" "}
            <span className="text-muted-foreground font-normal text-sm">/ noite</span>
          </p>
        )}
        <Button className="w-full mt-2" onClick={handleClick} disabled={!property.booking_url}>
          Ver detalhes e reservar
        </Button>
      </div>
    </article>
  );
}
