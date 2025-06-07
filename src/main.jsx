import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.scss";
import App from "./App.jsx";
import { AnnouncementProvider } from "./context/AnnoucementContext.jsx";
import ColorModeProvider from "./context/ColorModeContext.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnnouncementProvider>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </AnnouncementProvider>
  </StrictMode>
);
