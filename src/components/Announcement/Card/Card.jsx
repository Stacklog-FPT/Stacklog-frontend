import React from "react";
import "./Card.scss";

const Card = (props) => {
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

  return (
    <div className="card-container">
      <div className="avatar-title">
        <div className="avatar">
          <img src={props.avatar} alt="Avatar" />
          <i className="fa-solid fa-bell"></i>
        </div>
        <div className="announcement-content">
          <p className="announcement-content-title">
            <b>{props.name}:</b> {props.title}
          </p>
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
