import React, { useContext, useState } from "react";
import "./GroupComponent.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import GroupChat from "../GroupChat/GroupChat";
import RecentChat from "../RecentChatComponent/RecentChat";
const GroupComponent = () => {
  const { mode } = useContext(ColorModeContext);
  const [groups, setGroups] = useState([
    { id: 1, className: "SDN302c" },
    { id: 2, className: "SWP391c" },
    { id: 3, className: "SDN302c" },
    { id: 4, className: "SDN302c" },
  ]);
  return (
    <div className="group__container">
      <div className="group__heading">
        <select>
          {groups.map((item) => {
            return (
              <option value={item.className} key={item.id}>
                {item.className}
              </option>
            );
          })}
        </select>
        <div className={`group__input ${mode === "light" ? "light" : "dark"}`}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div>
        <GroupChat />
      </div>
      <div>
        <RecentChat />
      </div>
    </div>
  );
};

export default GroupComponent;
