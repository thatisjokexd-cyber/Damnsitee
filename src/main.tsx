import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyTheme, getTheme } from "./utils/storage";
import "./index.css";
import App from "./App";

// Apply theme immediately before render to avoid flash
applyTheme(getTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
