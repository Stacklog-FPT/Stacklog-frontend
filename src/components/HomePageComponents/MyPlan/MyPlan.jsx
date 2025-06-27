import React from "react";
import "./MyPlan.scss";
import dragIcon from "../../../assets/home/planDocument/drag-icon.png";
import moreIcon from "../../../assets/home/planDocument/more_horiz.png";
import zoomIcon from "../../../assets/home/planDocument/zoom_big.png";
const MyPlan = () => {
  return (
    <div className="my__plan__container">
      <div className="my__plan__heading">
        <div className="my__plan__heading__text">
          <img src={dragIcon} alt="..." />
          <p className="text-center pt-3">My Plan</p>
        </div>
        <div className="my__plan__heading__icon">
          <img src={moreIcon} alt="this is icon..." />
          <img src={zoomIcon} alt="this is icon..." />
        </div>
      </div>
    </div>
  );
};

export default MyPlan;
