import React from "react";
import "./Head.scss";
import imgLeft from "../../../assets/home/image54.png";
import taskImg from "../../../assets/home/head/task.png";
import completeImg from "../../../assets/home/head/complete.png";
import { useAuth } from "../../../context/AuthProvider";
const Head = () => {
  const { user } = useAuth();
  const today = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "November",
    "March",
    "June",
    "September",
    "December",
  ];

  const dayOfWeeks = days[today.getDay()];
  const month = months[today.getMonth()];
  const date = today.getDate();

  const getCurrentSession = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else if (hour >= 18 && hour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };
  return (
    <div className="head-container">
      <div className="head-container-left">
        <img src={imgLeft} alt="this is a image" />
        <div className="head-container-left-content">
          <div className="head-container-left-content-date">
            <h2>
              {dayOfWeeks} , {month} {date}
            </h2>
          </div>
          <div className="head-container-left-content-current-session">
            <h2 className="current-session-heading">{getCurrentSession()}!</h2>
            <h2 className="active">{user.username}</h2>
          </div>
        </div>
      </div>
      <div className="head-container-right">
        <div className="head-container-right-task">
          <img src={taskImg} alt="this is img task" />
          <div className="head-container-right-task-content">
            <span className="head-container-right-task-content-title">
              Task
            </span>
            {/* <span className="head-container-right-task-content-sum">241</span> */}
          </div>
        </div>
        <div className="head-container-right-task">
          <img src={completeImg} alt="this is img task" />
          <div className="head-container-right-task-content">
            <span className="head-container-right-task-content-title">
              Complete
            </span>
            {/* <span className="head-container-right-task-content-sum">241</span> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Head;
