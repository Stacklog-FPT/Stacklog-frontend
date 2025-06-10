import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.scss";
import App from "./App.jsx";
import { AnnouncementProvider } from "./context/AnnoucementContext.jsx";
import ColorModeProvider from "./context/ColorModeContext.jsx";
import SidebarProvider from "./context/SideBarContext.jsx";
import ChatProvider from "./context/ChatContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnnouncementProvider>
      <ColorModeProvider>
        <SidebarProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </SidebarProvider>
      </ColorModeProvider>
    </AnnouncementProvider>
  </StrictMode>
);
