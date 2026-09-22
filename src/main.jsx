import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./styles/global.css";
import "./styles/appearance.css";

import { aplicarApariencia } from "./utils/apariencia";

async function enableMocking() {
  // Los mocks solo se habilitan en desarrollo y de forma explícita.
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass", // lo que no esté mockeado, pasa a la red real
  });
}

// APLICAR APARIENCIA AL INICIAR
aplicarApariencia();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
