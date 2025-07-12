import { AnnouncementProvider } from "./AnnoucementContext";
import ColorModeProvider from "./ColorModeContext";
import SidebarProvider from "./SideBarContext";
import ChatProvider from "./ChatContext";
import { AuthProvider } from "./AuthProvider";

const Provides = ({ children }) => {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <ColorModeProvider>
          <SidebarProvider>
            <ChatProvider>{children}</ChatProvider>
          </SidebarProvider>
        </ColorModeProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
};

export default Provides;
