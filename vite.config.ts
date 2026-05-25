import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const appVersion = Date.now().toString();

  // Write public/version.json so the running app can poll it and detect new builds.
  try {
    const publicDir = path.resolve(__dirname, "public");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(
      path.join(publicDir, "version.json"),
      JSON.stringify({ version: appVersion, builtAt: new Date().toISOString() }) + "\n",
    );
  } catch (e) {
    // non-fatal; version check just won't work for this run
    console.warn("[version] could not write public/version.json:", e);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
