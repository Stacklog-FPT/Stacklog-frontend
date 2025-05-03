import React from "react";
import "./TaskByType.scss";

const TaskByType = ({ activeType, setActiveType }) => {
  const taskTypes = [
    { type: "All", icon: "fa-solid fa-globe" },
    { type: "By Status", icon: "fa-solid fa-chart-line" },
    { type: "Checklist", icon: "fa-solid fa-list" },
    { type: "My task", icon: "fa-solid fa-user" },
  ];

  return (
    <div className="task-by-type">
      <ul className="task-by-type-list">
        {taskTypes.map((item, index) => (
          <li
            className={`task-by-type-element ${
              activeType === item.type ? "active" : ""
            }`}
            onClick={() => setActiveType(item.type)}
            key={index}
          >
            <i className={item.icon}></i>
            <span>{item.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskByType;
