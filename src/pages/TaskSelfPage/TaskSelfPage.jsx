import React from 'react';
import './TaskSelfPage.scss';
import { useAuth } from '../../context/AuthProvider';
import { getPersonalTaskApi } from '../../service/TaskService';
import { useDispatch, useSelector } from 'react-redux';
import Column from '../../components/ClassComponent/CheckTaskByType/CheckTypeByAll/Column/Column';

const FALLBACK_COLOR = '#6b7280';

const normalize = (s) => (s ?? '').trim().toLowerCase();

const TaskSelfPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const { personalTask = {} } = useSelector((state) => state.task);
  const keyList = React.useMemo(() => Object.keys(personalTask), [personalTask]);

  const groupedByStatusName = React.useMemo(() => {
    const acc = {};
    Object.values(personalTask).forEach((arr) => {
      (arr || []).forEach((t) => {
        const k = normalize(t?.statusTask?.statusTaskName);
        if (!acc[k]) acc[k] = [];
        acc[k].push(t);
      });
    });
    return acc;
  }, [personalTask]);

  const columns = React.useMemo(() => {
    return keyList.map((label) => {
      const tasks = groupedByStatusName[normalize(label)] || [];
      const first = tasks[0];

      return {
        statusTaskName: label,
        statusTaskId: first?.statusTask?.statusTaskId ?? label,
        statusTaskColor: first?.statusTask?.statusTaskColor ?? FALLBACK_COLOR,
        tasks,
      };
    });
  }, [keyList, groupedByStatusName]);

  React.useEffect(() => {
    getPersonalTaskApi(user.token, dispatch);
  }, [user, dispatch]);

  return (
    <div className="task__self">
      <div className="task__self__container">
        <div className="task__self__container__heading">
          <h2>Your Task</h2>
        </div>

        <div className="task__self__container__content">
          {columns.map((col) => (
            <Column
              key={String(col.statusTaskId) || col.statusTaskName}
              color={col.statusTaskColor}
              statusId={col.statusTaskId}
              status={col.statusTaskName}
              tasks={col.tasks}
              onShowAddTask={() => {}}
              onShowComment={() => {}}
              onShowAddSubTask={() => {}}
              onTaskUpdated={() => {}}
              isLeader={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskSelfPage;
