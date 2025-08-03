import React from "react";
import Head from "../../components/HomePageComponents/Head/Head";
import Meeting from "../../components/HomePageComponents/Meeting/Meeting";
import "./Home.scss";
import MyPlan from "../../components/HomePageComponents/MyPlan/MyPlan";
import Document from "../../components/HomePageComponents/Document/Document";
import ListTask from "../../components/HomePageComponents/ListTask/ListTask";
import OverallProject from "../../components/HomePageComponents/OverallProject/OverallProject";
import { useAuth } from "../../context/AuthProvider";
import MemberList from "../../components/HomePageComponents/MemberList/MemberList";
const Home = () => {
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
  const year = today.getFullYear();

  const getCurrentHour = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour;
  };

  const isLecture = user?.role === "LECTURER";
  const getCurrentSession = () => {
    let amPm = "";
    if (getCurrentHour() == 1 && getCurrentHour() <= 12) {
      amPm = "AM";
    } else {
      amPm = "PM";
    }

    return amPm;
  };

  return (
    <div className="home__container">
      <Head />
      <Meeting />
      <div className="d-flex align-items-center justify-content-around mt-4 gap-4">
        <MyPlan
          getCurrentHour={getCurrentHour}
          getCurrentSession={getCurrentSession}
          dayOfWeeks={dayOfWeeks}
          month={month}
          date={date}
          year={year}
        />
        <Document />
      </div>
      <ListTask />

      {isLecture && <MemberList />}
    </div>
  );
};

export default Home;
