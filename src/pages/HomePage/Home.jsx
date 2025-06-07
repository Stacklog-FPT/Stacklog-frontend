import React from "react";
import Head from "../../components/HomePageComponents/Head/Head";
import Meeting from "../../components/HomePageComponents/Meeting/Meeting";
import "./Home.scss";
const Home = () => {
  return (
    <div className="home__container">
      <Head />
      <Meeting />
    </div>
  );
};

export default Home;
