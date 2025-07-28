import React, { useContext } from "react";
import "./LayoutAdmin.scss";
import SidebarAdmin from "../../components/SideBar/SideBarAdmin/SideBarAdmin";
import { SidebarContext } from "../../context/SideBarContext";
import InputSearch from "../../components/InputSearch/InputSearch";
import { Outlet } from "react-router-dom";
import { ColorModeContext } from "../../context/ColorModeContext";
const LayoutAdmin = () => {
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  const { mode } = useContext(ColorModeContext);
  return (
    <div className="layout">
      <SidebarAdmin isOpen={isOpen} setIsOpen={setIsOpen} />
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

export default LayoutAdmin;
