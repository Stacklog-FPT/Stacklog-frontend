import React from 'react';
import './TaskSelfPage.scss';
import { useAuth } from '../../context/AuthProvider';
import { decodeToken } from '../../service/DecodeJwt';
const TaskSelfPage = () => {
  const { user } = useAuth();
  return (
    <div className="task__self">
      <div className="task__self__container">
        <div className="task__self__container__heading">
          <h2>Your Task</h2>
        </div>
      </div>
    </div>
  );
};

export default TaskSelfPage;
