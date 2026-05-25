import { useEffect, useRef } from "react";
import { toast } from "sonner";

const POLL_MS = 60_000;

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.version === "string" ? json.version : null;
  } catch {
    return null;
  }
}

async function hardReload() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // ignore
  }
  window.location.reload();
}

export default function VersionWatcher() {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const currentVersion =
      typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : null;
    if (!currentVersion) return;

    let cancelled = false;

    const check = async () => {
      if (cancelled || notifiedRef.current) return;
      const remote = await fetchRemoteVersion();
      if (!remote || cancelled || notifiedRef.current) return;
      if (remote !== currentVersion) {
        notifiedRef.current = true;
        toast(
          "Nova versão disponível",
          {
            description:
              "Atualize a página para ver as últimas melhorias e correções.",
            duration: Infinity,
            action: {
              label: "Atualizar agora",
              onClick: () => hardReload(),
            },
          },
        );
      }
    };

    // initial check after small delay so it doesn't compete with first paint
    const initial = setTimeout(check, 5_000);
    const interval = setInterval(check, POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
