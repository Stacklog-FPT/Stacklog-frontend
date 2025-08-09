import React from "react";
import ClassList from "../../components/ClassListComponent/ClassList";
import AddClass from "../../components/ClassListComponent/AddClass/AddClass";
import Detailstudent from "../../components/ClassListComponent/Detailstudent/DetailStudent";
import "./TaskPage.scss";

const TaskPage = () => {
  const [activeDetailStudent, setActiveDetailStudent] = React.useState(false);
  const [activityAddClass, setActivityAddClass] = React.useState(false);

  const handleActiveDetailStudent = () => {
    setActiveDetailStudent(!activeDetailStudent);
  };

  const handleActivityAddClass = () => {
    setActivityAddClass(!activityAddClass);
  };

  return (
    <div>
      <ClassList
        handleActivityAddClass={handleActivityAddClass}
        handleActiveDetailStudent={handleActiveDetailStudent}
      />
      {activityAddClass && (
        <AddClass handleActivityAddClass={handleActivityAddClass} />
      )}
      {activeDetailStudent && (
        <Detailstudent handleActiveDetailStudent={handleActiveDetailStudent} />
      )}
    </div>
  );
};
export default TaskPage;
