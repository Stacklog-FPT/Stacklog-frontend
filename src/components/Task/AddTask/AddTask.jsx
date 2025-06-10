import React from "react";
import "./AddTask.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import assignUser from "../../../assets/task/assign-user.png";
import iconPriority from '../../../assets/task/icon-priority.png'
import iconSubTask from "../../../assets/task/icon-subtask.png";
const AddTask = (props) => {
  const visibleMembers = props.members.slice(0, 3);
  const extraCount = props.members.length - visibleMembers.length;
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
          <img src={iconPriority} alt="..."/>
          <h2>Priority</h2>
          <div className="">

          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default AddTask;
