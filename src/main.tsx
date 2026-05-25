import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Defensive cleanup: unregister any orphan service workers from older builds
// that could be serving a stale bundle to returning users.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()))
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
