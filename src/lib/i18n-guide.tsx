import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GuideLocale = "pt" | "en" | "es";

export const GUIDE_LOCALES: { code: GuideLocale; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

type TFn = (s: string | undefined | null) => string;

interface GuideI18nContextValue {
  locale: GuideLocale;
  t: TFn;
  isLoading: boolean;
}

const GuideI18nContext = createContext<GuideI18nContextValue>({
  locale: "pt",
  t: (s) => s ?? "",
  isLoading: false,
});

export function useGuideT() {
  return useContext(GuideI18nContext);
}

export function GuideI18nProvider({
  slug,
  locale,
  children,
}: {
  slug: string;
  locale: GuideLocale;
  children: ReactNode;
}) {
  const enabled = locale !== "pt" && !!slug;

  const { data, isLoading } = useQuery({
    queryKey: ["guide-translations", slug, locale],
    enabled,
    staleTime: 1000 * 60 * 60, // 1h
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("translate-guide", {
        body: { slug, locale },
      });
      if (error) throw error;
      return (data?.translations ?? {}) as Record<string, string>;
    },
  });

  const value = useMemo<GuideI18nContextValue>(() => {
    if (locale === "pt") {
      return { locale, isLoading: false, t: (s) => s ?? "" };
    }
    const map = data ?? {};
    return {
      locale,
      isLoading,
      t: (s) => {
        if (!s) return "";
        return map[s] ?? s;
      },
    };
  }, [locale, data, isLoading]);

  return (
    <GuideI18nContext.Provider value={value}>{children}</GuideI18nContext.Provider>
  );
}
