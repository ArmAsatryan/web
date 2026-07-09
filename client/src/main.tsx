import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAnalytics } from "@/lib/analytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}

initAnalytics();

// Firefox/mobile: restore from back-forward cache can leave a blank React tree.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
