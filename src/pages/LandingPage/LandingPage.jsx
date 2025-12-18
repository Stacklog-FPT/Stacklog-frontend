import React from "react";
import "./LandingPage.scss";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Banner from "./Section/Banner/Banner";
import Discover from "./Section/Discover/Discover";
import ManagerTask from "./Section/ManagerTask/ManagerTask";
import Feature from "./Section/Feature/Feature";
import BeginJourney from "./Section/BeginJourney/BeginJourney";
import CoFounder from "../../assets/Content.png";
import Section5 from "../../assets/section5.png";
const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main className="main-content d-flex flex-column align-items-center">
        <Banner />
        <Discover />
        <ManagerTask />
        <Feature />
        <img src={CoFounder} alt="this is an image" className="p-5" />
        <img src={Section5} alt="this is an image" className="p-5" />
        <BeginJourney />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
