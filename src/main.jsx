import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import "./styles/main.scss";
import App from "./App.jsx";
import theme from "./theme.js";
import { CssBaseline } from "@mui/material";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CssVarsProvider
      theme={theme}
      colorSchemeSelector=".mui-mode"
      defaultMode="light"
    >
      {/* <CssBaseline /> */}
      <App />
    </CssVarsProvider>
  </StrictMode>
);
