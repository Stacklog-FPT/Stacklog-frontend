import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InputSearch.scss";
import ButtonMode from "../ButtonMode/ButtonMode";
import { AnnouncementContext } from "../../context/AnnoucementContext";
import { useSelector } from "react-redux";

const ROUTE_SUGGESTIONS = [
  { path: "/", label: "Home", icon: "fa-house" },
  { path: "/tasks-self", label: "Personal Tasks", icon: "fa-list-check" },
  { path: "/class", label: "Class", icon: "fa-chalkboard" },
  { path: "/schedule", label: "Schedule", icon: "fa-calendar-days" },
  { path: "/documents", label: "Document", icon: "fa-folder-open" },
  { path: "/chatbox", label: "Chat", icon: "fa-comment-dots" },
  { path: "/meeting", label: "Meeting", icon: "fa-video" },
  { path: "/grades", label: "Grade", icon: "fa-chart-column" },
  { path: "/plan", label: "Topic", icon: "fa-clipboard-list" },
  { path: "/user-detail", label: "Profile", icon: "fa-user" },
  { path: "/notification", label: "All notifications", icon: "fa-bell" },
];

const InputSearch = () => {
  const [searchItem, setSearchItem] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  const { isAnnouncementVisible, toggleAnnouncement } =
    useContext(AnnouncementContext);
  const { userInfo } = useSelector((state) => state.users);
  const { notifications } = useSelector((state) => state.notification);
  const isHaveUnread = notifications.some((nt) => !nt.isRead);

  const query = searchItem.startsWith("/")
    ? searchItem.slice(1).toLowerCase()
    : "";
  const filteredRoutes = ROUTE_SUGGESTIONS.filter(
    (route) =>
      route.path.slice(1).toLowerCase().includes(query) ||
      route.label.toLowerCase().includes(query)
  );

  const isSlashCommand = searchItem.startsWith("/");

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchItem]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredRoutes.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredRoutes[selectedIndex]) {
          navigate(filteredRoutes[selectedIndex].path);
          setSearchItem("");
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, selectedIndex, filteredRoutes, navigate]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchItem(value);

    if (value.startsWith("/")) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchItem("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (searchItem.startsWith("/")) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="input-search">
      <div className="input-search-home">
        <Link to="/">
          <i className="fa-solid fa-house"></i>
        </Link>
      </div>

      <div className="input-search-wrapper">
        <div className="input-search-field">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or type / to navigate..."
            value={searchItem}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>
        {showSuggestions && isSlashCommand && filteredRoutes.length > 0 && (
          <div className="search-suggestions" ref={suggestionRef}>
            <div className="suggestions-header">
              <small>Jump to</small>
            </div>
            {filteredRoutes.map((route, index) => (
              <div
                key={route.path}
                className={`suggestion-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onClick={() => handleSuggestionClick(route.path)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <i className={`fa-solid ${route.icon}`}></i>
                <span className="label">{route.label}</span>
                <span className="path">{route.path || "/"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="input-search-user">
        <ButtonMode />
        <div className="input-search-user-bell" onClick={toggleAnnouncement}>
          <i
            className={`fa-solid fa-bell ${
              isAnnouncementVisible ? "active" : ""
            }`}
          ></i>
          {isHaveUnread && (
            <span className="input-search-user-bell-total"></span>
          )}
        </div>
        <div className="input-search-user-avatar">
          <Link to="/user-detail">
            {userInfo?.avatar_link ? (
              <img src={userInfo.avatar_link} alt="Avatar" />
            ) : (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyxOFawuDBFgxqKvyTSXmrWv_8vDw9xyhvOg&s"
                alt="Default avatar"
              />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InputSearch;
