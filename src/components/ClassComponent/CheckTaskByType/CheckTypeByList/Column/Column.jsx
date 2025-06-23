import React from "react";
import "./Column.scss";
import iconVector from "../../../../../assets/icon/task/iconVector.png";

const Column = ({ color, status, tasks }) => {
  console.log(tasks);
  return (
    <div className="column-list-container">
      <div className="column-list">
        <div className="prop-status" style={{ backgroundColor: color }}>
          <img src={iconVector} alt="vector icon" />
          <p>{status}</p>
        </div>
        <div className="column-task" data-status={status}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Assign</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>+</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Column;
