import React from "react";
import "./IncomingTask.scss";
import ChartComponent from "./ChartComponent/ChartComponent";
const IncomingTask = () => {
  return (
    <div className="incoming__task">
      <div className="incoming__task__container">
        <h2>Incomplete tasks by section</h2>
        <div className="incoming__task__container__main__content">
          <ChartComponent />
        </div>
      </div>
    </div>
  );
};

export default IncomingTask;
