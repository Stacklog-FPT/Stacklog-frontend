import React from 'react';
import './TaskSelfPage.scss';
import { useAuth } from '../../context/AuthProvider';
import { useSelector } from 'react-redux';
import { getPersonalTaskApi } from '../../service/TaskService';
import { selectCurrentSemesterId } from '../../redux/slice/semesterSlice';
import { useDispatch } from 'react-redux';
import Column from '../../components/ClassComponent/CheckTaskByType/CheckTypeByAll/Column/Column';

const FALLBACK_COLOR = '#6b7280';

const normalize = (s) => (s ?? '').trim().toLowerCase();

const TaskSelfPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const currentSemesterId = useSelector(selectCurrentSemesterId);
  const { personalTask = {} } = useSelector((state) => state.task);

  const columns = React.useMemo(() => {
    return Object.keys(personalTask || {}).map((label) => {
      const tasks = personalTask[label] || [];
      const first = tasks[0];

      return {
        statusTaskName: label,
        statusTaskId: first?.statusTaskId ?? label,
        statusTaskColor: first?.statusTask?.statusTaskColor ?? FALLBACK_COLOR,
        tasks,
      };
    });
  }, [personalTask]);

  React.useEffect(() => {
    getPersonalTaskApi(user.token, currentSemesterId, dispatch);
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
