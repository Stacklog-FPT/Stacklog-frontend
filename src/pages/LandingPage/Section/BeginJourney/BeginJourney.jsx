import React from "react";
import "./BeginJourney.scss";
import BeginImg from "../../../../assets/begin.png";
const BeginJourney = () => {
  return (
    <section className="begin-journey">
      <div className="container">
        <div className="row align-items-center gy-4">
          {/* Left content */}
          <div className="col-lg-6">
            <h2 className="section-title">Begin your course of action.</h2>
            <p className="section-desc">
              Discover how StackLog can improve your productivity today.
            </p>

            <div className="actions">
              <button className="btn btn-primary">Try it out</button>
              <button className="btn btn-outline-primary">Learn more</button>
            </div>
          </div>

          {/* Right content with image */}
          <div className="col-lg-6 text-center">
            <img src={BeginImg} alt="Dashboard" className="img-fluid" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeginJourney;
