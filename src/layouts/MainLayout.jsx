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
} from "../context/GroupchatContext";
import GroupComponent from "../components/ChatPageComponents/GroupComponent/GroupComponent";
import { SidebarContext } from "../context/SideBarContext";

const MainLayout = () => {
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const { mode } = useContext(ColorModeContext);
  const { isShowGroupChat, setIsShowGroupChat } = useContext(GroupChatContext);
  const location = useLocation();

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  useEffect(() => {
    if (location.pathname === "/chatbox") {
      setIsShowGroupChat(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }

    if (location.pathname === "/class") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [location.pathname, setIsShowGroupChat, setIsOpen]);

  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="announcement-place">
        {isAnnouncementVisible && <Announcement />}
      </div>
      {location.pathname === "/chatbox" && isShowGroupChat && (
        <GroupComponent />
      )}
      <main
        className={`main-content ${
          location.pathname === "/class-page" ? "no-scroll" : ""
        }`}
      >
        <InputSearch />
        <Outlet
          className={`main-content-area ${mode === "light" ? "light" : "dark"}`}
        />
      </main>
    </div>
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
