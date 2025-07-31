import React, { useContext, useState } from "react";
import "./GroupComponent.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import GroupChat from "../GroupChat/GroupChat";
import RecentChat from "../RecentChatComponent/RecentChat";
const GroupComponent = () => {
  const { mode } = useContext(ColorModeContext);

  return (
    <div className="group__container">
      <div className="group__heading">
        <div className={`group__input`}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <GroupChat />
      <RecentChat />
    </div>
  );
};

export default GroupComponent;
