import { useState, useEffect } from "react";
import "./Announcement.scss";
import Card from "./Card/Card";
import axios from "axios";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const [activeTab, setActiveTab] = useState("all");

  const handleGetNoti = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notifications");
      if (response) {
        setAnnouncements(response.data);
      }
    } catch (e) {
      return new Error(e.message);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredAnnouncements =
    activeTab === "unread"
      ? announcements.filter((item) => !item.isRead)
      : announcements;

  useEffect(() => {
    handleGetNoti();
    const interval = setInterval(() => {
      handleGetNoti(); // Cập nhật mỗi 30 giây
    }, 30000); // 30000 ms = 30 giây

    return () => clearInterval(interval);
  }, []);
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
          {sortedAnnouncements.length > 0 ? (
            sortedAnnouncements.map((item) => (
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
