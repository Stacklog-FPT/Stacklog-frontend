import React, { useState, useEffect, useRef } from 'react';
import './Column.scss';
import iconMore from '../../../../../assets/icon/task/iconMoreTask.png';
import iconVector from '../../../../../assets/icon/task/iconVector.png';
import Task from '../Task/Task';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useAuth } from '../../../../../context/AuthProvider';
import ModalColumn from '../../../../ModalChange/ModalColumn/ModalColumn';
import { useSelector } from 'react-redux';

const Column = ({
  color,
  statusId,
  status,
  tasks,
  onShowAddTask,
  onShowComment,
  onShowAddSubTask,
  onTaskUpdated,
  isLeader,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `droppable-${statusId}` });
  const { user } = useAuth();
  const pending = useSelector((s) => s.status.pending);
  const [openModalColumnId, setOpenModalColumnId] = useState(null);
  const [modalAnchor, setModalAnchor] = useState({ top: 0, left: 0 });
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const columnRef = useRef(null);
  const handleIconMoreClick = (e) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    const top = btnRect.bottom + window.scrollY + 8;
    const left = btnRect.left + window.scrollX;
    setModalAnchor({ top, left });
    setOpenModalColumnId((prev) => (prev === statusId ? null : statusId));
  };

  const handleEditColumn = () => {
    setIsEditFormOpen(true);
    setOpenModalColumnId(null);
  };

  useEffect(() => {
    if (!openModalColumnId) return;
    const onKey = (ev) => ev.key === 'Escape' && setOpenModalColumnId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openModalColumnId]);

  return (
    <div className={`column-container ${isOver ? 'over' : ''}`} ref={setNodeRef}>
      <div className="column" ref={columnRef}>
        <div className="prop-status" style={{ backgroundColor: color }}>
          <div className="prop-status-left">
            <div className="prop-status-left-text">
              <img src={iconVector} alt="vector icon" />
              <span>{status}</span>
              <span className="prop-status-text-total-task">
                {pending ? <Skeleton width={20} height={16} /> : tasks ? tasks.length : 0}
              </span>
            </div>
          </div>

          <div className="prop-status-right">
            <img
              src={iconMore}
              alt="more icon"
              onClick={handleIconMoreClick}
              style={{ cursor: 'pointer' }}
            />

            {openModalColumnId === statusId && (
              <ModalColumn
                statusId={statusId}
                onEdit={handleEditColumn}
                onClose={() => setOpenModalColumnId(null)}
                anchor={modalAnchor}
              />
            )}
          </div>
        </div>

        <SortableContext
          id={statusId}
          items={tasks?.map((task) => task.taskId) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-task" data-status={statusId}>
            {pending ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="task-skeleton" style={{ marginBottom: '10px' }}>
                  <Skeleton height={80} borderRadius={8} />
                </div>
              ))
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Task
                  key={task?.taskId}
                  id={task?.taskId}
                  title={task?.taskTitle}
                  createdAt={task?.taskStartTime}
                  dueDate={task?.taskDueDate}
                  onShowComment={onShowComment}
                  onShowAddSubTask={onShowAddSubTask}
                  onTaskUpdated={onTaskUpdated}
                  task={task}
                />
              ))
            ) : (
              <div className="no-tasks">No tasks available</div>
            )}
          </div>
        </SortableContext>

        {(user.role === 'LECTURER' || isLeader()) && (
          <div className="btn-add-task" onClick={onShowAddTask}>
            <i className="fa-solid fa-plus" style={{ color: '#000' }} />
            <span>Add Task</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Column);
