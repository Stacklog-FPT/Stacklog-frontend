import React from "react";
import "./ScheduleDetailCard.scss";

const ScheduleDetailCard = ({ slot, onClose }) => {
  if (!slot) return null;
  return (
    <div className="schedule__detail__card">
      <div className="schedule__detail__card__container">
        <button className="close-btn" onClick={onClose}>
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div className="upcoming">Upcoming</div>
        <div className="meeting-title">Today's Meeting</div>
        <div className="meeting-info-row">
          <span className="meeting-title-badge">Meeting title</span>
          <span className="meeting-time">
            <i className="fa-regular fa-clock"></i>
            {slot.hour} - {parseInt(slot.hour) + 4}.00PM
          </span>
        </div>
        <div className="meeting-info-row">
          <div className="meeting-members">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
          <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="" />
          <img src="https://randomuser.me/api/portraits/women/46.jpg" alt="" />
        </div>
        <div className="meeting-link">Join meeting on google meet</div>
        <button className="add-btn"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailCard;
