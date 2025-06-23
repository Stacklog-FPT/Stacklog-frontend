import React from "react";
import "./Column.scss";
import iconVector from "../../../../../assets/icon/task/iconVector.png";
import add from "../../../../../assets/icon/checkTaskByList/add.png";
import Task from "../Task/Task";

const Column = ({ color, status, tasks, members }) => {
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
                <th>
                  <img src={add} alt="icon..." />
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((item) => {
                  return <Task title={item.title} members={members} />;
                })
              ) : (
                <h2>No task for today!</h2>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Column;
