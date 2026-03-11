import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./shared/i18n";
import { registerSW } from "./shared/utils/pwa.js";

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerSW();
}

createRoot(document.getElementById("root")).render(<App />);
