import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import "./MainLayout.scss";
import InputSearch from "../components/InputSearch/InputSearch";
import Announcement from "../components/Announcement/Announcement";
import { AnnouncementContext } from "../context/AnnoucementContext";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const someState = false;
  console.log("from mainlayout:", someState);
  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="announcement-place">
        {isAnnouncementVisible && <Announcement />}
      </div>
      <main className="main-content">
        <InputSearch />
        <Outlet className="main-content-area" />
      </main>
    </div>
  );
};

export default MainLayout;
