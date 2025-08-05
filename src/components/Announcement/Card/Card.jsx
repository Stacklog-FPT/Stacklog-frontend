import { useState, useEffect } from "react";
import "./Card.scss";
import userApi from "../../../service/UserService";
import { useAuth } from "../../../context/AuthProvider";

const Card = (props) => {
  const { user } = useAuth();
  const { getUserById } = userApi();
  const [userDetail, setUserDetail] = useState({
    name: "Loading...",
    avatar:
      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
  });

  const getUserIdFromTitle = (title) => {
    const prefix = "Task assigned to ";
    if (title.startsWith(prefix)) {
      return title.slice(prefix.length);
    }
    return null;
  };
  const getTimeDifference = (createdAt) => {
    const now = new Date();
    const createTime = new Date(createdAt);
    const diffInMs = now - createTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(
          user.token,
          getUserIdFromTitle(props.title)
        );
        setUserDetail({
          name: userData.name || "Unknown User",
          avatar:
            userData.avatar ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        });
      } catch (error) {
        console.error("Error fetching user:", error.message);
        setUserDetail({
          name: "Unknown User",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        });
      }
    };

    fetchUser();
  }, [props.name, getUserById]);

  return (
    <div className="card-container">
      <div className="avatar-title">
        <div className="avatar">
          <img src={user.avatar} alt="Avatar" />
          <i className="fa-solid fa-bell"></i>
        </div>
        <div className="announcement-content">
          <p className="announcement-content-title">{props.title}</p>
          <p className="announcement-content-time">
            {getTimeDifference(props.createdAt)}
          </p>
        </div>
      </div>
      {props.isRead ? (
        ""
      ) : (
        <div className="notRead">
          <p className="dot-red"></p>
        </div>
      )}
    </div>
  );
};

export default Card;
