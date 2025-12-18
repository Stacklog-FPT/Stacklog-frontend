import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../../assets/main-logo.png";
import logoClose from "../../assets/Logo.png";
import logoDark from "../../assets/darkMode/logo-darkmode.png";
import "./SideBar.scss";
import { ColorModeContext } from "../../context/ColorModeContext";
import { GroupChatContext } from "../../context/GroupChatContext";
import { useAuth } from "../../context/AuthProvider";
import { fetchSemesters } from "../../service/SemesterService";
import { getClasses } from "../../service/ClassService";
import SemesterDropdown from "../Modal/SemesterList/SemesterDropdown";
import ClassDropdown from "../../components/Modal/ClassList/ClassDropDown";

import {
  selectSemester,
  selectSemesters,
  selectCurrentSemesterId,
} from "../../redux/slice/semesterSlice";

const SideBar = ({ isOpen, setIsOpen }) => {
  const { mode } = useContext(ColorModeContext);
  const { toggleGroupChat } = useContext(GroupChatContext);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const semesters = useSelector(selectSemesters);
  const currentSemesterId = useSelector(selectCurrentSemesterId);
  const [showClasses, setShowClasses] = useState(false);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const handleChatClick = () => {
    toggleGroupChat();
    setIsOpen(!isOpen);
    navigate("/chatbox");
  };

  const dashBoardItems = [
    { name: "Home", path: "/home", icon: "fa-solid fa-house", showIcon: true },
    {
      name: "Schedule",
      path: "/schedule",
      icon: "fa-solid fa-calendar-days",
      showIcon: true,
    },
    {
      name: "Documents",
      path: "/documents",
      icon: "fa-solid fa-folder-plus",
      showIcon: true,
    },
    {
      name: "Chat",
      path: "/chatbox",
      icon: "fa-solid fa-comment",
      showIcon: true,
      onClick: handleChatClick,
    },
    {
      name: "Grades",
      path: "/grades",
      icon: "fa-solid fa-square-poll-vertical",
      showIcon: true,
    },
    {
      name: "Topic",
      path: "/plan",
      icon: "fa-solid fa-diagram-project",
      showIcon: true,
    },
    {
      name: "Task",
      path: "/tasks-self",
      icon: "fa-solid fa-list-check",
      showIcon: true,
    },
    {
      name: "Class",
      path: "/class",
      icon: "fa-solid fa-users",
      showIcon: isOpen,
    },
  ];

  useEffect(() => {
    if (user?.token) fetchSemesters(user.token, dispatch);
  }, [dispatch, user?.token]);

  useEffect(() => {
    if (currentSemesterId && user?.token)
      getClasses(currentSemesterId, user.token, dispatch);
  }, [currentSemesterId, user?.token, dispatch]);

  const handleOverlayClick = () => setIsOpen(false);

  return (
    <>
      {isMobile && !isOpen && (
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <i className="fa-solid fa-bars" />
        </button>
      )}

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div
        className={`navbar-container ${isOpen ? "open" : "close"}`}
        onClick={isMobile ? (e) => e.stopPropagation() : undefined}
      >
        <div className="wrapper_navbar">
          <div
            className={`wrapper_navbar_header ${isOpen ? "isOpen" : "isClose"}`}
          >
            <Link to="/home">
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

          <div className="semester__picker">
            {isOpen && <label className="semester__label">Semester</label>}
            <SemesterDropdown
              semesters={semesters || []}
              value={currentSemesterId ?? null}
              onChange={(id) => dispatch(selectSemester(id))}
              placeholder="Select semester"
              isSidebarOpen={isOpen}
            />
          </div>

          <nav className="navbar-dashboard">
            <h2 className="navbar-dashboard-heading">DashBoard</h2>
            <ul>
              {dashBoardItems.map((item, index) => (
                <li
                  key={index}
                  className={item.name === "Class" ? "class-item" : ""}
                >
                  {item.name === "Class" ? (
                    <ClassDropdown
                      currentSemester={currentSemesterId}
                      showClasses={showClasses}
                      setShowClasses={setShowClasses}
                      isSidebarOpen={isOpen}
                    />
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      {...(item.onClick ? { onClick: item.onClick } : {})}
                    >
                      <div className="nav-icon-container">
                        {item.showIcon ? <i className={item.icon}></i> : null}
                        <span className="nav-icon-container-text">
                          {item.name}
                        </span>
                      </div>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* <nav className="navbar-support">
            <h2 className="navbar-support-heading">Support</h2>
            <ul>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-icon-container">
                    <i className="fa-solid fa-gear"></i>
                    <span className="nav-icon-container-text">Settings</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </nav> */}
        </div>
      </div>
    </>
  );
};

export default SideBar;
