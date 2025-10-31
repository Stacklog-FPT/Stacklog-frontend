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
import Grade from '../../components/Modal/Grade/Grade';
import DetailScore from '../../components/GradesComponents/DetailScore/DetailScore';
import Overall from '../../pages/OverallGroup/OverallGroup';
import { getScoreCategoriesByClass } from '../../service/ScoreService';
import { useAuth } from '../../context/AuthProvider';
const ClassPage = () => {
  const [activeType, setActiveType] = React.useState('TaskBoard');
  const { user } = useAuth();
  const token = user?.token || null;

  // DetailScore modal state
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailStudent, setDetailStudent] = React.useState(null);
  const [detailCategories, setDetailCategories] = React.useState([]);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailGroupId, setDetailGroupId] = React.useState(null);

  // handleActiveDetail can be called with a payload to open detail, or with no args to close
  const handleActiveDetail = async (payload) => {
    if (!payload) {
      // close
      setDetailOpen(false);
      setDetailStudent(null);
      setDetailCategories([]);
      setDetailGroupId(null);
      setDetailLoading(false);
      return;
    }

    const { student, classId, groupId } = payload || {};
    setDetailStudent(student || null);
    setDetailGroupId(groupId || null);
    // fetch categories for class if available
    const clsId = classId || (student && (student.classId || student.class || null));
    if (!clsId) {
      setDetailCategories([]);
      setDetailLoading(false);
      setDetailOpen(true);
      return;
    }

    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const cats = await getScoreCategoriesByClass(clsId, token);
      if (Array.isArray(cats)) setDetailCategories(cats);
      else setDetailCategories([]);
    } catch (err) {
      console.warn('Failed to load score categories for detail view', err);
      setDetailCategories([]);
    } finally {
      setDetailLoading(false);
    }
  };
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
        {activeType === 'Grade' && user?.role === 'LECTURER' && (
          <Grade handleActiveDetail={handleActiveDetail} />
        )}
        {detailOpen && (
          <DetailScore
            handleActiveDetail={() => handleActiveDetail()}
            student={detailStudent}
            categories={detailCategories}
            loading={detailLoading}
            groupId={detailGroupId}
          />
        )}
        {activeType === 'Chat' && <ClassList />}
        {activeType === 'Overall' && <Overall />}
      </div>
    </div>
  );
};

export default ClassPage;
