import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/main-logo.png";
import logoClose from "../../assets/Logo.png";
import sideBarIcon from "../../assets/icon/sidebaricon/Side-Bar-Icon.png";
import logoDark from "../../assets/darkMode/logo-darkmode.png";
import sideBarDark from "../../assets/darkMode/sidebar-dark-mode.png";
import "./SideBar.scss";
import { ColorModeContext } from "../../context/ColorModeContext";

const SideBar = ({ isOpen, setIsOpen }) => {
  const { mode } = useContext(ColorModeContext);
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`navbar-container ${isOpen ? "open" : "close"} ${
        mode === "light" ? "nav-light" : "nav-dark"
      }`}
    >
      <div className="wrapper_navbar">
        <div
          className={`wrapper_navbar_header ${isOpen ? "isOpen" : "isClose"}`}
        >
          <Link to="/">
            {mode === "light" ? (
              <img
                src={isOpen ? logo : logoClose}
                className="wrapper_navbar_header_logo"
                alt="Logo web"
              />
            ) : (
              <img
                src={logoDark}
                className="wrapper_navbar_header_logo"
                alt="Logo web"
              />
            )}
          </Link>
          <button className="wrapper_navbar_toggle" onClick={toggleSidebar}>
            <i
              className={isOpen ? "fa-solid fa-times" : "fa-solid fa-bars"}
            ></i>
          </button>
        </div>

        {/* DashBoard */}
        <nav className="navbar-dashboard">
          <h2 className="navbar-dashboard-heading">DashBoard</h2>
          <ul>
            {dashBoardItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {item.name === "Class" ? (
                    <div className="nav-icon-container">
                      <div className="nav-icon-container-inner">
                        {item.icon && <i className={item.icon}></i>}
                        <span className="nav-icon-container-text">
                          {item.name}
                        </span>
                      </div>
                      <i className="fa-solid fa-arrow-right"></i>
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
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
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
