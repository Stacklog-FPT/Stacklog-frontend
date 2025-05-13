import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import "./styles/main.scss";
import App from "./App.jsx";
import theme from "./theme.js";
import { CssBaseline } from "@mui/material";
import { AnnouncementProvider } from "./context/AnnoucementContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnnouncementProvider>
      <CssVarsProvider
        theme={theme}
        colorSchemeSelector=".mui-mode"
        defaultMode="light"
      >
        <App />
      </CssVarsProvider>
    </AnnouncementProvider>
  </StrictMode>
);
