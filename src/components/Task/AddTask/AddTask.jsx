import React from "react";
import "./AddTask.scss";
import iconSubTask from "../../../assets/task/icon-subtask.png";
const AddTask = (props) => {
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

        </div>
      </div>
    </div>
  );
};

export default AddTask;
