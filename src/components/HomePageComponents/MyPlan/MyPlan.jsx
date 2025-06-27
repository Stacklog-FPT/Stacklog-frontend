import React, { useState } from "react";
import "./MyPlan.scss";
import dragIcon from "../../../assets/home/planDocument/drag-icon.png";
import moreIcon from "../../../assets/home/planDocument/more_horiz.png";
import zoomIcon from "../../../assets/home/planDocument/zoom_big.png";

const MyPlan = () => {
  const [activeType, setActiveType] = useState("Todo");
  const planType = [{ type: "Todo" }, { type: "Done" }, { type: "Delegated" }];

  return (
    <div className="my__plan__container">
      <div className="my__plan__heading">
        <div className="my__plan__heading__text">
          <img src={dragIcon} alt="Drag icon" />
          <p className="text-center pt-3">My Plan</p>
        </div>
        <div className="my__plan__heading__icon">
          <img src={moreIcon} alt="More icon" />
          <img src={zoomIcon} alt="Zoom icon" />
        </div>
      </div>
      <div className="my__plan__navbar">
        <ul className="my__plan__navbar__list">
          {planType.map((item) => (
            <li
              key={item.type}
              className={`my__plan__navbar__element ${
                activeType === item.type ? "active" : ""
              }`}
              onClick={() => setActiveType(item.type)}
            >
              {item.type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyPlan;
