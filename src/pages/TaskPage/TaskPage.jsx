import React from "react";
import TaskListComponent from "../../components/TaskListComponents/TaskListComponent/TaskListComponent";
import "./TaskPage.scss";
import IncomingTask from "../../components/TaskListComponents/IncomingTask/IncomingTask";
import TotalTask from "../../components/TaskListComponents/TotalTask/TotalTask";
const TaskPage = () => {
  return (
    <div className="task__page">
      <TaskListComponent />
      <div className="incoming__total">
        <IncomingTask />
        <TotalTask />
      </div>
    </div>
  );
};

export default TaskPage;
