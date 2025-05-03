import React from "react";
import "./Meeting.scss";
import Calendar from "./Calendar/Calendar";
import DetailMeeting from "./DetailMeeting/DetailMeeting";
const Meeting = () => {
  return (
    <div className="meeting">
      <div className="meeting__title">
        <h2>Next Upcoming Meeting</h2>
      </div>
      <div className="meeting__content">
      <Calendar/>
      <DetailMeeting/>
      </div>
    </div>
  );
};

export default Meeting;
