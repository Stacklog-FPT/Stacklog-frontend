import React from "react";
import "./Meeting.scss";
import Calendar from "../../ScheduleComponents/Calendar/Calendar";
import DetailMeeting from "./DetailMeeting/DetailMeeting";
import { useAuth } from "../../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Meeting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div
      className="meeting__container "
      onClick={() => {
        navigate("/schedule");
      }}
    >
<<<<<<< HEAD
=======
      {/* {isLecture && <OverallProject />} */}
>>>>>>> 3990268b468b90373a267000fd4c4de07b4d183a
      <div className="meeting">
        <div className="meeting__title">
          <h2>Next Upcoming Meeting</h2>
        </div>
        <div className="meeting__content">
          <div className="meeting__calendar">
            <Calendar isPage={true} />
          </div>
          <DetailMeeting />
<<<<<<< HEAD
=======
          {/* {isLecture ? "" : <DetailMeeting />} */}
>>>>>>> 3990268b468b90373a267000fd4c4de07b4d183a
        </div>
      </div>
    </div>
  );
};

export default Meeting;
