import { useContext, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import "./MainLayout.scss";
import InputSearch from "../components/InputSearch/InputSearch";
import Announcement from "../components/Announcement/Announcement";
import { AnnouncementContext } from "../context/AnnoucementContext";
import { ColorModeContext } from "../context/ColorModeContext";
import {
  GroupChatContext,
  GroupChatProvider,
} from "../context/GroupChatContext";
import { SidebarContext } from "../context/SideBarContext";
import { Toaster } from "sonner";
import "../styles/main.scss";
import { useAuth } from "../context/AuthProvider";
import SideBarAdmin from "../components/SideBar/SideBarAdmin/SideBarAdmin";
import ComposeMail from "../components/MailCompose/ComposeMail";
import { FaEnvelope } from "react-icons/fa";
import { useSelector } from "react-redux";
import LoadingComponent from "../components/Loading/LoadingComponent";

const MainLayout = () => {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const { mode } = useContext(ColorModeContext);
  const { isShowGroupChat, setIsShowGroupChat } = useContext(GroupChatContext);
  const location = useLocation();
  const [composeOpen, setComposeOpen] = useState(false);
  const isAnyPending = useSelector((state) => {
    return (
      state.semester.pending,
      state.class.pending,
      state.document.pending,
      state.group.pending,
      state.schedule.pending,
      state.status.pending,
      state.task.pending
    );
  });

  console.log("Pending in layout: ", isAnyPending);
  useEffect(() => {
    if (window.innerWidth > 1024) {
      setIsOpen(true);
    } else {
      // On mobile, close sidebar when navigating to chat
      if (location.pathname.startsWith("/chatbox")) {
        setIsOpen(false);
      }
    }

    if (location.pathname === "/class") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // return () => {
    //   document.body.style.overflow = "auto";
    //   // clearTimeout(timer);
    // };
  }, [location.pathname, setIsShowGroupChat, setIsOpen]);

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  return (
    <>
      <LoadingComponent isLoading={isAnyPending} />
      <div className="layout">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="announcement-place">
          {isAnnouncementVisible && <Announcement />}
        </div>
        <main
          className={`main-content ${
            location.pathname === "/class-page" ? "no-scroll" : ""
          } ${location.pathname.startsWith("/chat") ? "chat-page" : ""}`}
        >
          <InputSearch />
          <Toaster
            position="bottom-right"
            richColors
            duration={4000}
            closeButton
          />
          <Outlet
            className={`main-content-area ${
              mode === "light" ? "light" : "dark"
            }`}
          />
        </main>

        {(location.pathname === "/notification" ||
          location.pathname.startsWith("/notification")) &&
          !composeOpen &&
          user &&
          (user.role || "").toString().toUpperCase() === "LECTURER" && (
            <>
              <button
                aria-label="Compose mail"
                onClick={() => setComposeOpen(true)}
                style={{
                  position: "fixed",
                  right: 24,
                  bottom: 24,
                  zIndex: 1200,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#045745",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaEnvelope size={20} />
              </button>
            </>
          )}

        <ComposeMail
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSend={async (payload) => {
            console.log("ComposeMail onSend payload", payload);
            await new Promise((r) => setTimeout(r, 600));
            setComposeOpen(false);
            alert("Message sent (demo)");
          }}
        />
      </div>
    </>
  );
};

const MainLayoutWithProvider = () => {
  return (
    <GroupChatProvider>
      <MainLayout />
    </GroupChatProvider>
  );
};

export default MainLayoutWithProvider;
