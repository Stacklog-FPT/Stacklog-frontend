import React, { useState } from "react";
import "./AddTask.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import assignUser from "../../../assets/task/assign-user.png";
import iconPriority from "../../../assets/task/icon-priority.png";
import iconSubTask from "../../../assets/task/icon-subtask.png";
import trackTime from "../../../assets/task/icon-track-time.png";

const AddTask = (props) => {
  const visibleMembers = props.members.slice(0, 3);
  const extraCount = props.members.length - visibleMembers.length;

  const [colorPriority, setColorPriority] = useState([
    { id: 1, color: "#FFFAEB", content: "High" },
    { id: 2, color: "#3a9e3e", content: "Normal" },
    { id: 3, color: "#6d706e", content: "Chill" },
  ]);

  const [selectedPriority, setSelectedPriority] = useState(
    colorPriority[0].content
  );

  const selectedColor =
    colorPriority.find((item) => item.content === selectedPriority)?.color ||
    "#FFFFFF";

  return (
    <div className="add-task-container">
      <div className="wrapper-title">
        <h2 className="text-heading">Title</h2>
        <i className="fa-solid fa-xmark" onClick={props.onCancel}></i>
      </div>
      <div className="wrapper-description">
        <h2>Description</h2>
        <textarea placeholder="Enter a description..." required />
      </div>
      <div className="wrapper-subtask">
        <div className="wrapper-subtask-heading">
          <img src={iconSubTask} alt="..." />
          <h2>Subtask</h2>
        </div>
        <div className="wrapper-input">
          <i className="fa-solid fa-plus"></i>
          <input type="text" placeholder="Create Subtask" />
        </div>
      </div>
      <div className="wrapper-assign-user">
        <div className="wrapper-assign-user-heading">
          <img src={assignUser} alt="..." />
          <h2>Assign</h2>
        </div>
        <div className="wrapper-assign-user-content">
          <ul
            className="student-list"
            data-extra-count={extraCount > 0 ? extraCount : ""}
          >
            {visibleMembers.map((item) => (
              <li key={item.id}>
                <img src={item.img} alt="Student Avatar" />
              </li>
            ))}
            {extraCount > 0 && (
              <li className="extra-count">
                <span>+{extraCount}</span>
              </li>
            )}
          </ul>
          <div className="button-add" onClick={() => alert("cc")}>
            <img src={avatar_add_button} alt="add_button_icon" />
          </div>
        </div>
      </div>
      <div className="wrapper-priority">
        <div className="wrapper-priority-heading">
          <img src={iconPriority} alt="..." />
          <h2>Priority</h2>
        </div>
        <select
          className="priority_status"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{ backgroundColor: selectedColor }}
        >
          {colorPriority.map((item) => (
            <option key={item.id} value={item.content}>
              {item.content}
            </option>
          ))}
        </select>
      </div>
      <div className="wrapper-start-end-time">
        <div className="wrapper_input_time">
          <p>Start</p>
          <div className="date-input-container">
            <input type="date" className="date-input" />
          </div>
        </div>
        <div className="wrapper_input_time">
          <p>Deadline</p>
          <div className="date-input-container">
            <input type="date" className="date-input" />
          </div>
        </div>
      </div>
      <div className="wrapper-track-time">
        <div className="wrapper-track-time-heading">
          <img src={trackTime} alt="...icon" />
          <h2>Track time</h2>
        </div>
        <div className="wrapper-track-time-input">
          <input type="text" placeholder="Enter your date" />
          <input type="text" placeholder="Enter your time" />
          <input type="text" placeholder="Enter your time" />
        </div>
      </div>
      <div>
        fhdasgbfidgahui
      </div>
      <div>
        fhdasgbfidgahui
      </div>
    </div>
  );
};

export default AddTask;
