import React from "react";
import TaskListComponent from "../../components/TaskListComponents/TaskListComponent/TaskListComponent";
import "./MorePage.scss";
import IncomingTask from "../../components/TaskListComponents/IncomingTask/IncomingTask";
import TotalTask from "../../components/TaskListComponents/TotalTask/TotalTask";
import UpcomingTask from "../../components/TaskListComponents/UpcomingTask/UpcomingTask";
import TaskCompletion from "../../components/TaskListComponents/TaskCompletion/TaskCompletion";
const TaskPage = () => {
  return (
    <div className="task__page">
      <TaskListComponent />
      <div className="incoming__total">
        <IncomingTask />
        <TotalTask />
      </div>
      <UpcomingTask />
      <TaskCompletion />
    </div>
  );
};

export default TaskPage;
