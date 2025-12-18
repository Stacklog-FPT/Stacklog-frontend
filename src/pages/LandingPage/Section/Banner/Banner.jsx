import React from "react";
import "./Banner.scss";
import BannerImg from "../../../../assets/banner.png";
const Banner = () => {
  return (
    <div className="banner d-flex flex-column align-items-center gap-3 p-5">
      <div className="banner_container d-flex flex-column align-items-center gap-2">
        <div className="title d-flex flex-column align-items-center">
          <h2>STACKLOG</h2>
          <p>
            A smarter workplace that empowers teams to work more efficiently,
            collaboratively, and intelligently
          </p>
        </div>
        <div className="content d-flex flex-column align-items-center gap-2">
          <p>
            Welcome to WorkFlowPro, a platform that helps you manage tasks and
            collaborate more effectively than ever before. Discover how we can
            help you optimize your workflow and achieve your project goals.
          </p>
          <div className="content_btn d-flex align-items-center gap-4">
            <button className="start">Start</button>
            <button className="learn_more">Learn more</button>
          </div>
        </div>
        <div>
          <img src={BannerImg} alt="this is banner img" />
        </div>
      </div>
    </div>
  );
};

export default Banner;
