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

  const { isAnnouncementVisible, toggleAnnouncement } =
    useContext(AnnouncementContext);
  const { userInfo } = useSelector((state) => state.users);
  const { notifications } = useSelector((state) => state.notification);

  const groups = useSelector((state) => state.group.groups || []);

  const isHaveUnread = notifications.some((nt) => !nt.isRead);

  const query = searchItem.startsWith("/")
    ? searchItem.slice(1).toLowerCase()
    : "";

  // Lọc routes
  const filteredRoutes = ROUTE_SUGGESTIONS.filter(
    (route) =>
      route.path.slice(1).toLowerCase().includes(query) ||
      route.label.toLowerCase().includes(query)
  );

  const filteredGroups = groups
    .filter((group) => {
      if (!query) return true;
      return (
        group.groupsName?.toLowerCase().includes(query) ||
        group.groupsDescriptions?.toLowerCase().includes(query)
      );
    })

    .filter((group) => group.groupsName && group.groupsName !== "unassigned");

  const isSlashCommand = searchItem.startsWith("/");

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchItem]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      const totalItems = filteredRoutes.length + filteredGroups.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();

        if (selectedIndex < filteredRoutes.length) {
          const route = filteredRoutes[selectedIndex];
          navigate(route.path);
        } else {
          const groupIndex = selectedIndex - filteredRoutes.length;
          const group = filteredGroups[groupIndex];
          if (group) {
            navigate(`/tasks/${group.groupsId}`);
          }
        }

        setSearchItem("");
        setShowSuggestions(false);
        inputRef.current?.blur();
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showSuggestions,
    selectedIndex,
    filteredRoutes,
    filteredGroups,
    navigate,
  ]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchItem(value);
    setShowSuggestions(value.startsWith("/"));
  };

  const handleInputFocus = () => {
    if (searchItem.startsWith("/")) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleRouteClick = (path) => {
    navigate(path);
    setSearchItem("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleGroupClick = (groupId) => {
    navigate(`/tasks/${groupId}`);
    setSearchItem("");
    setShowSuggestions(false);
    inputRef.current?.blur();
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
            placeholder="Search or type /to navigate or /g..."
            value={searchItem}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {showSuggestions &&
          isSlashCommand &&
          (filteredRoutes.length > 0 || filteredGroups.length > 0) && (
            <div className="search-suggestions">
              {filteredRoutes.length > 0 && (
                <>
                  <div className="suggestions-header">
                    <small>Jump to</small>
                  </div>
                  {filteredRoutes.map((route, index) => (
                    <div
                      key={route.path}
                      className={`suggestion-item ${
                        selectedIndex === index ? "selected" : ""
                      }`}
                      onClick={() => handleRouteClick(route.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <i className={`fa-solid ${route.icon}`}></i>
                      <span className="label">{route.label}</span>
                      <span className="path">{route.path || "/"}</span>
                    </div>
                  ))}
                </>
              )}

              {filteredGroups.length > 0 && (
                <>
                  <div className="suggestions-header">
                    <small>Groups</small>
                  </div>
                  {filteredGroups.map((group, index) => {
                    const globalIndex = filteredRoutes.length + index;
                    return (
                      <div
                        key={group.groupsId}
                        className={`suggestion-item ${
                          selectedIndex === globalIndex ? "selected" : ""
                        }`}
                        onClick={() => handleGroupClick(group.groupsId)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <i className="fa-solid fa-users"></i>
                        <span className="label">{group.groupsName}</span>
                        {group.groupsDescriptions && (
                          <span className="description">
                            {group.groupsDescriptions}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
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
