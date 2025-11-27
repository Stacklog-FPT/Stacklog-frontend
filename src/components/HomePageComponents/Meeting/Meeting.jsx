import React from "react";
import "./Meeting.scss";
import Calendar from "../../ScheduleComponents/Calendar/Calendar";
import DetailMeeting from "./DetailMeeting/DetailMeeting";
import { useAuth } from "../../../context/AuthProvider";
import OverallProject from "../OverallProject/OverallProject";
import MainComponent from "../../ScheduleComponents/MainComponent";
import { useNavigate } from "react-router-dom";

const Meeting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLecture = user?.role == "LECTURER";
  return (
    <div
      className={`meeting__container ${
        isLecture ? "with-project" : "no-project"
      }`}
      onClick={() => {
        navigate("/schedule");
      }}
    >
      {isLecture && <OverallProject />}
      <div className="meeting">
        <div className="meeting__title">
          <h2>Next Upcoming Meeting</h2>
        </div>
        <div className="meeting__content">
          <div className="meeting__calendar">
            <Calendar isPage={true} />
          </div>
          {isLecture ? "" : <DetailMeeting />}
        </div>
      </div>
    </div>
  );
};

export default Meeting;
