import { useState } from "react";
import "./Announcement.scss";
import Card from "./Card/Card";
import { useNotifications } from "../../context/NotificationContext";

const Announcement = () => {
  const { notifications } = useNotifications();
  const [activeTab, setActiveTab] = useState("all");
  const userMap = {
    "688e110fe4acb643f2bbc47b": "John Doe",
  };

  const sortedAnnouncements = [...notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => ({
      ...item,
      author: {
        ...item.author,
        name: userMap[item.author.name] || "Unknown User",
      },
    }));

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredAnnouncements =
    activeTab === "unread"
      ? sortedAnnouncements.filter((item) => !item.isRead)
      : sortedAnnouncements;

  console.log("Filtered Announcements:", filteredAnnouncements);

  return (
    <div className="announcement-container">
      <div className="main-announcement">
        <div className="main-announcement-header">
          <h1>Announcement</h1>
          <i className="fa-solid fa-bars"></i>
        </div>
        <div className="main-announcement-categories">
          <p
            className={activeTab === "all" ? "active" : ""}
            onClick={() => handleTabClick("all")}
          >
            All
          </p>
          <p
            className={activeTab === "unread" ? "active" : ""}
            onClick={() => handleTabClick("unread")}
          >
            Unread Messages
          </p>
        </div>
        <div className="main-announcement-list">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((item) => (
              <Card
                key={item._id}
                avatar={item.author.avatar}
                title={item.title}
                isRead={item.isRead}
                createdAt={item.createdAt}
                name={item.author.name}
              />
            ))
          ) : (
            <div className="main-announcement-list-empty">
              <p className="main-announcement-list-empty-text">
                No announcement now!
              </p>
            </div>
          )}
        </div>
        <button className="btn-see-all">See All Announcements</button>
      </div>
    </div>
  );
};

export default Announcement;
