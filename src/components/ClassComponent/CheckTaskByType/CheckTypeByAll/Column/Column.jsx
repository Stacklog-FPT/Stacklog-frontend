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
import { useDispatch, useSelector } from 'react-redux';
import { updateStatusApi } from '../../../../../service/ColumnService';
import { toast } from 'sonner';

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
  const dispatch = useDispatch();

  const pending = useSelector((s) => s.status.pending);
  const statuses = useSelector((s) => s.status.statuses || []);

  const selectedStatus = statuses.find((it) => String(it.statusTaskId) === String(statusId)); // Mì ăn liền
  const statusItemId = selectedStatus?.id; // Mì ăn liền

  const [openModalColumnId, setOpenModalColumnId] = useState(null);
  const [modalAnchor, setModalAnchor] = useState({ top: 0, left: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(status || '');

  const columnRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) setDraftName(status || '');
  }, [isEditing, status]);

  const handleIconMoreClick = (e) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    const top = btnRect.bottom + window.scrollY + 8;
    const left = btnRect.left + window.scrollX;
    setModalAnchor({ top, left });
    setOpenModalColumnId((prev) => (prev === statusId ? null : statusId));
  };

  const startEditing = () => {
    setIsEditing(true);
    setOpenModalColumnId(null);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const endEditing = async (commit) => {
    if (!isEditing) return;
    setIsEditing(false);

    const newName = draftName.trim();
    const oldName = (status || '').trim();

    if (!commit) return;
    if (!newName || newName === oldName) return;

    if (!statusItemId) return;

    const payload = {
      ...selectedStatus,
      statusTaskName: newName,
    };

    const response = await updateStatusApi(user.token, statusItemId, payload, dispatch);
    if (response.status === 200) {
      toast.success('Column updated successfully!');
    } else {
      toast.error('Something wrong!');
    }
  };

  useEffect(() => {
    if (!isEditing) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        endEditing(false);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        endEditing(true);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isEditing, draftName, statusItemId, selectedStatus, user?.token]);

  useEffect(() => {
    if (!isEditing) return;
    const onDown = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        endEditing(true);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isEditing, draftName, statusItemId, selectedStatus, user?.token]);

  return (
    <div className={`column-container ${isOver ? 'over' : ''}`} ref={setNodeRef}>
      <div className="column" ref={columnRef}>
        <div className="prop-status" style={{ backgroundColor: color }}>
          <div className="prop-status-left">
            <div className="prop-status-left-text">
              <img src={iconVector} alt="vector icon" />

              {isEditing ? (
                <input
                  ref={inputRef}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => endEditing(true)}
                  className="edit-input"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 5,
                    fontWeight: 500,
                    outline: 'none',
                  }}
                  autoFocus
                />
              ) : (
                <span>{status}</span>
              )}

              <span className="prop-status-text-total-task">
                {!isEditing &&
                  (pending ? <Skeleton width={20} height={16} /> : tasks ? tasks.length : 0)}
              </span>
            </div>
          </div>

          {!isEditing && (
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
                  onEdit={startEditing}
                  onClose={() => setOpenModalColumnId(null)}
                  anchor={modalAnchor}
                />
              )}
            </div>
          )}
        </div>

        <SortableContext
          id={statusId}
          items={tasks?.map((t) => t.taskId) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-task" data-status={statusId}>
            {pending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="task-skeleton" style={{ marginBottom: 10 }}>
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
