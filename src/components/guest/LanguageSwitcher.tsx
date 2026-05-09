import { Languages, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GUIDE_LOCALES, type GuideLocale } from "@/lib/i18n-guide";

interface Props {
  locale: GuideLocale;
  onChange: (locale: GuideLocale) => void;
  isLoading?: boolean;
}

export function LanguageSwitcher({ locale, onChange, isLoading }: Props) {
  const current = GUIDE_LOCALES.find((l) => l.code === locale) ?? GUIDE_LOCALES[0];

  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white transition-colors ring-1 ring-black/5"
          aria-label="Change language"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          <span className="text-base leading-none">{current.flag}</span>
          <span className="uppercase text-xs font-semibold tracking-wide">
            {current.code}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {GUIDE_LOCALES.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => onChange(l.code)}
              className={locale === l.code ? "bg-accent/40" : ""}
            >
              <span className="mr-2 text-base">{l.flag}</span>
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
