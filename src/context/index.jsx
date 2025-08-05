import { AnnouncementProvider } from "./AnnoucementContext";
import ColorModeProvider from "./ColorModeContext";
import SidebarProvider from "./SideBarContext";
import ChatProvider from "./ChatContext";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationContext";

const Provides = ({ children }) => {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <ColorModeProvider>
          <NotificationProvider>
            <SidebarProvider>
              <ChatProvider>{children}</ChatProvider>
            </SidebarProvider>
          </NotificationProvider>
        </ColorModeProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
};

export default Provides;
