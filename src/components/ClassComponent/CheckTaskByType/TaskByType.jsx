import React from 'react';
import './TaskByType.scss';
import { useAuth } from '../../../context/AuthProvider';
const TaskByType = ({ activeType, setActiveType }) => {
  const { user } = useAuth();
  const taskTypes = [
    { type: 'TaskBoard', icon: 'fa-solid fa-globe' },
    { type: 'TaskList', icon: 'fa-solid fa-list' },
    { type: 'Overall', icon: 'fa-solid fa-comment' },
    { type: 'Schedules', icon: 'fa-solid fa-list' },
    { type: 'Classes', icon: 'fa-solid fa-users' },
    { type: 'Documents', icon: 'fa-solid fa-folder-plus' },
    { type: 'Topic', icon: 'fas fa-tasks' },
    { type: 'Grade', icon: 'fa-solid fa-square-poll-vertical' },
    { type: 'Chat', icon: 'fa-solid fa-comment' },

    // { type: "By Status", icon: "fa-solid fa-chart-line" },
    // {
    //   type: user?.role === "LECTURER" ? "Class List" : "My Task",
    //   icon: "fa-solid fa-user",
    // },
  ];

  return (
    <div className="task-by-type">
      <ul className="task-by-type-list">
        {taskTypes
          .filter((item) => item.type !== 'Grade' || String(user?.role || '').toLowerCase() === 'lecturer')
          .map((item, index) => (
          <li
            className={`task-by-type-element ${activeType === item.type ? 'active' : ''}`}
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
