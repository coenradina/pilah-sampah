import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../penjaga_lingkungan";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
