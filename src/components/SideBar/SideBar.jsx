import React from "react";
import logo from "../../assets/main-logo.png";
import "./SideBar.scss";
import sideBarIcon from "../../assets/icon/sidebaricon/Side-Bar-Icon.png";
import { Link, NavLink } from "react-router-dom";

const SideBar = ({ isOpen, setIsOpen, mode }) => {
  const dashBoardItems = [
    { name: "Home", path: "/", icon: "fa-solid fa-house" },
    { name: "Class", path: "/class", icon: "fa-solid fa-users" },
    { name: "Task", path: "/tasks", icon: "fa-solid fa-list-check" },
    { name: "Schedule", path: "/schedule", icon: "fa-solid fa-calendar-days" },
    { name: "Documents", path: "/documents", icon: "fa-solid fa-folder-plus" },
    { name: "Chat", path: "/chatbox", icon: "fa-solid fa-comment" },
    { name: "Grades", path: "/grades", icon: "fa-solid fa-user-graduate" },
    { name: "Plan", path: "/plan", icon: "fas fa-tasks" },
    { name: "More", path: "/more", icon: "fas fa-info-circle" },
  ];

  return (
    <div
      className={`navbar-container ${isOpen ? "open" : "close"} ${
        mode ? "light" : "dark"
      } `}
    >
      <div className="wrapper_navbar">
        <Link to="/">
          <div className="wrapper_navbar_header">
            <img
              src={logo}
              className="wrapper_navbar_header_logo"
              alt="Logo web"
            />
            <img
              src={sideBarIcon}
              alt="Sidebar icon"
              className="wrapper_navbar_header_icon"
            />
          </div>
        </Link>

        {/* DashBoard */}
        <nav className="navbar-dashboard">
          <h2 className="navbar-dashboard-heading">DashBoard</h2>
          <ul>
            {dashBoardItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => {
                    return `nav-link ${isActive ? "active" : ""}`;
                  }}
                >
                  {item.name === "Class" ? (
                    <div
                      className="nav-icon-container"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        {item.icon && <i className={item.icon}></i>}
                        <span className="nav-icon-container-text">
                          {item.name}
                        </span>
                      </div>
                      <div>
                        <i className="fa-solid fa-arrow-right"></i>
                      </div>
                    </div>
                  ) : (
                    <div className="nav-icon-container">
                      {item.icon && <i className={item.icon}></i>}
                      <span className="nav-icon-container-text">
                        {item.name}
                      </span>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Support */}
        <nav className="navbar-support">
          <h2 className="navbar-support-heading">Support</h2>
          <ul>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => {
                  return `nav-link ${isActive ? "active" : ""}`;
                }}
              >
                <div className="nav-icon-container">
                  <i className="fa-solid fa-gear"></i>
                  <span className="nav-icon-container-text">Settings</span>
                </div>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
