import React from "react";
import "./ClassPage.scss";
import TaskByType from "../../components/ClassComponent/CheckTaskByType/TaskByType";
import CheckTypeByAll from "../../components/ClassComponent/CheckTaskByType/CheckTypeByAll/CheckTypeByAll";
import CheckTypeByList from "../../components/ClassComponent/CheckTaskByType/CheckTypeByList/CheckTypeByList";
import CheckTaskBySelf from "../../components/ClassComponent/CheckTaskByType/CheckTaskBySelf/CheckTaskBySelf";
import CheckTaskByStatus from "../../components/ClassComponent/CheckTaskByType/CheckTaskByStatus/CheckTaskByStatus";
const ClassPage = () => {
  const [activeType, setActiveType] = React.useState("All");
  return (
    <div className="class-page">
      <div className="class-page-overview">
        <h2>Team work overview</h2>
      </div>
      <TaskByType activeType={activeType} setActiveType={setActiveType} />

      {activeType === "All" && <CheckTypeByAll />}
      {activeType === "Checklist" && <CheckTypeByList />}
      {activeType === "By Status" && <CheckTaskByStatus />}
      {activeType === "My Task" && <CheckTaskBySelf />}
    </div>
  );
};

export default ClassPage;
