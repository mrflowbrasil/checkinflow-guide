import { Instagram, Facebook } from "lucide-react";

type Tenant = {
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  bio: string | null;
};

export function CatalogHeader({ tenant }: { tenant: Tenant }) {
  const initials = tenant.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex flex-col items-center text-center gap-3 pt-2">
      <div
        className="h-20 w-20 rounded-full overflow-hidden border-2 bg-background flex items-center justify-center text-lg font-semibold"
        style={{ borderColor: tenant.primary_color ?? undefined }}
      >
        {tenant.logo_url ? (
          <img src={tenant.logo_url} alt={tenant.name} loading="eager" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <h1 className="text-xl font-semibold leading-tight">{tenant.name}</h1>
      {tenant.bio && <p className="text-sm text-muted-foreground max-w-xs">{tenant.bio}</p>}
      <div className="flex gap-3">
        {tenant.instagram_url && (
          <a href={tenant.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="h-5 w-5 text-muted-foreground" />
          </a>
        )}
        {tenant.facebook_url && (
          <a href={tenant.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="h-5 w-5 text-muted-foreground" />
          </a>
        )}
      </div>
    </header>
  );
}
