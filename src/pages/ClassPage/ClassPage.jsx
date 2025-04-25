import React from "react";
import "./ClassPage.scss";
import TaskByType from "../../components/ClassComponent/CheckTaskByType/TaskByType";
import CheckTypeByAll from "../../components/ClassComponent/CheckTaskByType/CheckTypeByAll/CheckTypeByAll";
const ClassPage = () => {
  return (
    <div className="class-page">
      <div className="class-page-overview">
        <h2>Team work overview</h2>
      </div>
      <TaskByType />
      <CheckTypeByAll />
    </div>
  );
};

export default ClassPage;
