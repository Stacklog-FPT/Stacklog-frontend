import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../../assets/main-logo.png";
import logoClose from "../../../assets/Logo.png";
import logoDark from "../../../assets/darkMode/logo-darkmode.png";
import "./SideBarAdmin.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import { useAuth } from "../../../context/AuthProvider";

const SideBarAdmin = ({ isOpen, setIsOpen }) => {
  const { mode } = useContext(ColorModeContext);
  const { user } = useAuth();

  return (
    <div className={`navbar-container ${isOpen ? "open" : "close"}`}>
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
          <button className="wrapper_navbar_toggle">
            <i
              className={isOpen ? "fa-solid fa-times" : "fa-solid fa-bars"}
            ></i>
          </button>
        </div>
        {/* Support */}
        <nav className="navbar-support">
          <h2 className={`navbar-support-heading ${isOpen ? "" : "hidden"}`}>
            Support
          </h2>
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
                  <span
                    className={`nav-icon-container-text ${
                      isOpen ? "" : "hidden"
                    }`}
                  >
                    Settings
                  </span>
                </div>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBarAdmin;
