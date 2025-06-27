import React from "react";
import Head from "../../components/HomePageComponents/Head/Head";
import Meeting from "../../components/HomePageComponents/Meeting/Meeting";
import "./Home.scss";
import MyPlan from "../../components/HomePageComponents/MyPlan/MyPlan";
import Document from "../../components/HomePageComponents/Document/Document";
import ListTask from "../../components/HomePageComponents/ListTask/ListTask";
const Home = () => {
  return (
    <div className="home__container">
      <Head />
      <Meeting />
      <div className="d-flex align-items-center justify-content-around mt-4">
        <MyPlan />
        <Document />
      </div>
      <ListTask />
    </div>
  );
};

export default Home;
