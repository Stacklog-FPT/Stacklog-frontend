import React, { useContext, useState } from "react";
import "./GroupComponent.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import GroupChat from "../GroupChat/GroupChat";
import RecentChat from "../RecentChatComponent/RecentChat";
const GroupComponent = () => {
  const { mode } = useContext(ColorModeContext);
  const [showAddGroup, setShowAddGroup] = useState(false);

  return (
    <div className="group__container">
      <div className="group__heading">
        <div className={`group__input`}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search" />
        </div>
        <button
          className="btn-add-group"
          onClick={() => setShowAddGroup(true)}
          aria-label="Add Group"
        >
          <i className="fa-solid fa-user-plus"></i>
          {/* <span className="visually-hidden">Add Group</span> */}
        </button>
      </div>
      <GroupChat
        showAddGroup={showAddGroup}
        setShowAddGroup={setShowAddGroup}
        defaultBoxType={"GROUP"}
      />
      <RecentChat />
    </div>
  );
};

export default GroupComponent;
