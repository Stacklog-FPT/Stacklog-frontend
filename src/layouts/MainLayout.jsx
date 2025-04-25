import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import "./MainLayout.scss";
import InputSearch from "../components/InputSearch/InputSearch";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="main-content">
        <InputSearch />
        <Outlet className="main-content-area" />
      </main>
    </div>
  );
};

export default MainLayout;
