import React from "react";
import "./Meeting.scss";
import Calendar from "./Calendar/Calendar";
import DetailMeeting from "./DetailMeeting/DetailMeeting";
import { useAuth } from "../../../context/AuthProvider";
import OverallProject from "../OverallProject/OverallProject";

const Meeting = () => {
  const { user } = useAuth();

  const isLecture = user?.role == "LECTURER";
  return (
    <div className={`meeting__container ${isLecture ? "with-project" : "no-project"}`}>
      {isLecture && <OverallProject />}
      <div className="meeting">
        <div className="meeting__title">
          <h2>Next Upcoming Meeting</h2>
        </div>
        <div className="meeting__content">
          <div className="meeting__calendar">
            <Calendar />
          </div>
          {isLecture ? "" : <DetailMeeting />}
        </div>
      </div>
    </div>
  );
};

export default Meeting;
