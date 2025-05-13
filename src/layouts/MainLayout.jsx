import { useContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import "./MainLayout.scss";
import InputSearch from "../components/InputSearch/InputSearch";
import Announcement from "../components/Announcement/Announcement";
import { AnnouncementContext } from "../context/AnnoucementContext";
import { ColorModeContext } from "../context/ColorModeContext";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const { mode } = useContext(ColorModeContext);

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);
  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} mode={mode} />
      <div className="announcement-place">
        {isAnnouncementVisible && <Announcement />}
      </div>
      <main className="main-content">
        <InputSearch />
        <Outlet className={`main-content-area ${mode} ? light : dark`} />
      </main>
    </div>
  );
};

export default MainLayout;
