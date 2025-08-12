import { useContext, useEffect, useState, Fragment } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../../assets/main-logo.png';
import logoClose from '../../assets/Logo.png';
import logoDark from '../../assets/darkMode/logo-darkmode.png';
import './SideBar.scss';
import { ColorModeContext } from '../../context/ColorModeContext';
import { GroupChatContext } from '../../context/GroupChatContext';
import { useAuth } from '../../context/AuthProvider';
import { FaArrowDown } from 'react-icons/fa6';
import { FaArrowRight } from 'react-icons/fa6';
import { fetchSemesters } from '../../service/SemesterService';

import {
  selectSemester,
  selectClass,
  selectSemesters,
  selectCurrentSemester,
  selectClassesOfCurrentSemester,
  selectPending,
  selectError,
} from '../../redux/slice/semesterSlice';

const SideBar = ({ isOpen, setIsOpen }) => {
  const { mode } = useContext(ColorModeContext);
  const { toggleGroupChat } = useContext(GroupChatContext);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const semesters = useSelector(selectSemesters);
  const currentSemester = useSelector(selectCurrentSemester);
  const classesOfCurrent = useSelector(selectClassesOfCurrentSemester);
  const pending = useSelector(selectPending);
  const error = useSelector(selectError);

  const [showSemesters, setShowSemesters] = useState(false);
  const [openSemesterId, setOpenSemesterId] = useState(null);
  const [openClassId, setOpenClassId] = useState(null);
  useEffect(() => {
    if (!user?.token) return;
    dispatch(fetchSemesters(user.token)).then(() => setShowSemesters(true));
  }, [dispatch, user?.token]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleChatClick = () => {
    toggleGroupChat();
    setIsOpen(!isOpen);
    navigate('/chatbox');
  };

  const handleGetSemester = async (e) => {
    e?.preventDefault?.();
    if (!user?.token) return;
    await dispatch(fetchSemesters(user.token));
    setShowSemesters((v) => !v);
    if (showSemesters) {
      setOpenSemesterId(null);
      setOpenClassId(null);
    }
  };

  const onClickSemester = (sem) => {
    dispatch(selectSemester(sem.id));
    setOpenSemesterId((curr) => (curr === sem.id ? null : sem.id));
    setOpenClassId(null);
  };

  const onClickClass = (cls) => {
    dispatch(selectClass(cls.id));
    setOpenClassId((curr) => (curr === cls.id ? null : cls.id));
  };

  const dashBoardItems = [
    { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
    { name: 'Task', path: '/tasks', icon: 'fa-solid fa-list-check' },
    { name: 'Class', path: '#', icon: 'fa-solid fa-users', onClick: handleGetSemester },
    { name: 'Schedule', path: '/schedule', icon: 'fa-solid fa-calendar-days' },
    { name: 'Documents', path: '/documents', icon: 'fa-solid fa-folder-plus' },
    { name: 'Chat', path: '/chatbox', icon: 'fa-solid fa-comment' },
    { name: 'Grades', path: '/grades', icon: 'fa-solid fa-user-graduate' },
    { name: 'Plan', path: '/plan', icon: 'fas fa-tasks' },
    { name: 'More', path: '/more', icon: 'fas fa-info-circle' },
  ];

  return (
    <div className={`navbar-container ${isOpen ? 'open' : 'close'}`}>
      <div className="wrapper_navbar">
        <div className={`wrapper_navbar_header ${isOpen ? 'isOpen' : 'isClose'}`}>
          <Link to="/">
            {mode === 'light' ? (
              <img
                src={isOpen ? logo : logoClose}
                className="wrapper_navbar_header_logo"
                alt="Logo web"
              />
            ) : (
              <img src={logoDark} className="wrapper_navbar_header_logo" alt="Logo web" />
            )}
          </Link>
          <button className="wrapper_navbar_toggle" onClick={toggleSidebar}>
            <i className={isOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'}></i>
          </button>
        </div>

        {/* DASHBOARD */}
        <nav className="navbar-dashboard">
          <h2 className="navbar-dashboard-heading">DashBoard</h2>
          <ul>
            {dashBoardItems.map((item, index) => {
              const isClassItem = item.name === 'Class';
              return (
                <Fragment key={index}>
                  <li>
                    {isClassItem ? (
                      <div className="nav-link" onClick={item.onClick}>
                        <div className="nav-icon-container">
                          <div className="nav-icon-container-inner">
                            {item.icon && <i className={item.icon}></i>}
                            <span className="nav-icon-container-text">{item.name}</span>
                          </div>
                          <div className={`arrow-transition ${showSemesters ? 'rotated' : ''}`}>
                            <FaArrowRight />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => {
                          if (item.onClick) item.onClick(e);
                          if (item.name === 'Chat') handleChatClick();
                        }}
                      >
                        <div className="nav-icon-container">
                          {item.icon && <i className={item.icon}></i>}
                          <span className="nav-icon-container-text">{item.name}</span>
                        </div>
                      </NavLink>
                    )}
                  </li>

                  {isClassItem && showSemesters && semesters.length > 0 && (
                    <ul className={`nested-list semester-list ${showSemesters ? 'open' : ''}`}>
                      {semesters.map((sem) => {
                        const activeSem = openSemesterId === sem.id;
                        return (
                          <li key={sem.id}>
                            <button
                              className={`nav-link ${activeSem ? 'active' : ''}`}
                              onClick={() => onClickSemester(sem)}
                            >
                              <span>{sem.semesterName}</span>
                            </button>

                            {activeSem && (
                              <ul className={`nested-list class-list ${activeSem ? 'open' : ''}`}>
                                {(sem.id === currentSemester?.id
                                  ? classesOfCurrent
                                  : sem.classes || []
                                ).map((cls) => {
                                  const openThisClass = openClassId === cls.id;
                                  const initial = (cls.name || '').trim()[0] || '?';
                                  return (
                                    <li key={cls.id} className="class-item">
                                      <div className="class-head" onClick={() => onClickClass(cls)}>
                                        <div className="class-avatar">{initial}</div>
                                        <span className="class-name">{cls.name}</span>
                                        <div className="class-actions">
                                          <button className="icon-btn" title="More">
                                            <i className="fa-solid fa-ellipsis"></i>
                                          </button>
                                          <button className="icon-btn" title="Add group">
                                            <i className="fa-solid fa-plus"></i>
                                          </button>
                                        </div>
                                      </div>

                                      {openThisClass &&
                                        Array.isArray(cls.groups) &&
                                        cls.groups.length > 0 && (
                                          <ul
                                            className={`nested-list group-list ${
                                              openThisClass ? 'open' : ''
                                            }`}
                                          >
                                            {cls.groups.map((group) => (
                                              <li key={group.id} className="group-item">
                                                <button className="group-link">
                                                  <i className="fa-solid fa-list-ul"></i>
                                                  <span className="group-name">
                                                    {group.groupName}
                                                  </span>
                                                  {/* <span className="badge">
                                                    {group.groupsStudent?.length ?? 0}
                                                  </span> */}
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Fragment>
              );
            })}
          </ul>

          {pending && <div className="navbar-loading">Loading semesters...</div>}
          {error && <div className="navbar-error">Error: {error}</div>}
        </nav>

        {/* SUPPORT */}
        <nav className="navbar-support">
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
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
