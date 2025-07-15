import { useState } from "react";
import "./Announcement.scss";
import Card from "./Card/Card";


const Announcement = () => {
  const [announcements, setAnnouncements] = useState([
    {
      _id: 1,
      title: "Deadline môn SDN",
      author: {
        _id: 1,
        name: "HoaiNt",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-12",
      isRead: false,
    },
    {
      _id: 2,
      title: "Deadline môn MMA",
      author: {
        _id: 1,
        name: "NamNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-05",
      isRead: true,
    },
    {
      _id: 3,
      title: "Deadline môn EXE",
      author: {
        _id: 1,
        name: "KhuyNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-02",
      isRead: true,
    },
    {
      _id: 4,
      title: "Deadline môn EXE",
      author: {
        _id: 1,
        name: "KhuyNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-02",
      isRead: true,
    },
    {
      _id: 5,
      title: "Deadline môn EXE",
      author: {
        _id: 1,
        name: "KhuyNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-02",
      isRead: true,
    },
    {
      _id: 6,
      title: "Deadline môn EXE",
      author: {
        _id: 1,
        name: "KhuyNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-02",
      isRead: true,
    },
    {
      _id: 7,
      title: "Deadline môn EXE",
      author: {
        _id: 1,
        name: "KhuyNV",
        avatar:
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      createdAt: "2025-05-02",
      isRead: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredAnnouncements =
    activeTab === "unread"
      ? announcements.filter((item) => !item.isRead)
      : announcements;

  const displayedAnnouncements = filteredAnnouncements.slice(0, 5);

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
          {displayedAnnouncements.length > 0 ? (
            displayedAnnouncements.map((item) => (
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
