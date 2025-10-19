import React from 'react';
import './ClassPage.scss';
import TaskByType from '../../components/ClassComponent/CheckTaskByType/TaskByType';
import CheckTypeByAll from '../../components/ClassComponent/CheckTaskByType/CheckTypeByAll/CheckTypeByAll';
import CheckTypeByList from '../../components/ClassComponent/CheckTaskByType/CheckTypeByList/CheckTypeByList';
import Schedules from '../../components/Modal/Schedules/Schedules';
import ClassList from '../../components/ClassComponent/CheckTaskByType/ClassList/ClassList';
import Topic from '../../components/Modal/Topic/Topic';
import Classes from '../../components/Modal/Classes/Classes';
import Document from '../../components/ClassComponent/CheckTaskByType/Documents/Document';
const ClassPage = () => {
  const [activeType, setActiveType] = React.useState('TaskBoard');
  return (
    <div className="class-page">
      <div className="class-page-overview">
        <h2>Team work overview</h2>
      </div>
      <TaskByType activeType={activeType} setActiveType={setActiveType} />
      <div className="class-page-container">
        {activeType === 'TaskBoard' && <CheckTypeByAll />}
        {activeType === 'TaskList' && <CheckTypeByList />}
        {activeType === 'Schedules' && <Schedules />}
        {activeType === 'Classes' && <Classes />}
        {activeType === 'Documents' && <Document />}
        {activeType === 'Topic' && <Topic />}
        {activeType === 'Chat' && <ClassList />}
      </div>
    </div>
  );
};

export default ClassPage;
