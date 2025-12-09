import React, { useEffect, useState, useCallback } from 'react';
import './CheckTypeByList.scss';
import Column from './Column/Column';
import Task from './Task/Task';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AddTask from '../../../Task/AddTask/AddTask';
import CommentTask from '../../../Task/CommentTask/CommentTask';
import ClassAndMember from '../../ClassAndMember/ClassAndMember';
import { useAuth } from '../../../../context/AuthProvider';
import AddColumn from '../../../Column/AddColumn/AddColumn';
import AddSubTask from '../../../Task/AddSubTask/AddSubTask';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../../../../redux/slice/taskSlice';
import { getAllTask, updateTaskApi } from '../../../../service/TaskService';
import { getStatus } from '../../../../service/ColumnService';
import { isLeader } from '../../../../helper/validateStudentGroup';
import decodeToken from '../../../../service/DecodeJwt';
import ModalAI from '../../../ModalAI/ModalAI';

const CheckTypeByList = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const statuses = useSelector((s) => s.status.statuses);
  const tasks = useSelector((t) => t.task.tasks);
  const groupList = useSelector((state) => state.group.groups);
  const currentGroup = groupList.find((g) => g.groupsId === groupId);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [showAddSubTask, setShowAddSubTask] = useState(null);
  const matchRole = isLeader(currentGroup, decodeToken(user.token).id);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  const updateTaskStatus = async (payload) => {
    await updateTaskApi(payload, user.token, dispatch);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = tasks.find((t) => t.taskId === active.id);
    setActiveTask(activeTask);
  };

  const handleDragOver = ({ over }) => {
    if (!over) return setActiveColumn(null);
    const overId = over.id;

    if (overId.startsWith('droppable-')) {
      setActiveColumn(overId.replace('droppable-', ''));
    } else {
      const overTask = tasks.find((t) => t.taskId === overId);
      setActiveColumn(overTask ? overTask.statusTaskId : null);
    }
  };

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveTask(null);
      if (!over) {
        setActiveColumn(null);
        return;
      }

      const activeId = active.id;
      const overId = over.id;
      const current = tasks.find((t) => String(t.taskId) === activeId);
      if (!current) {
        setActiveColumn(null);
        return;
      }

      let targetStatusId = null;

      if (overId.startsWith('droppable-')) {
        targetStatusId = overId.replace('droppable-', '');
      } else {
        const overTask = tasks.find((t) => String(t.taskId) === overId);
        if (!overTask) {
          setActiveColumn(null);
          return;
        }
        targetStatusId = overTask.statusTaskId;
      }

      const sameColumn = String(current.statusTaskId) === String(targetStatusId);
      let updated = [...tasks];
      const activeIndex = updated.findIndex((t) => String(t.taskId) === activeId);

      if (sameColumn) {
        if (!overId.startsWith('droppable-')) {
          const overIndex = updated.findIndex((t) => String(t.taskId) === overId);
          updated = arrayMove(updated, activeIndex, overIndex);
        }
      } else {
        const payload = { ...current, statusTaskId: targetStatusId };
        updateTaskStatus(payload);

        updated.splice(activeIndex, 1);

        if (!overId.startsWith('droppable-')) {
          const overIndex = updated.findIndex((t) => String(t.taskId) === overId);
          updated.splice(overIndex, 0, {
            ...current,
            statusTaskId: targetStatusId,
          });
        } else {
          updated.push({
            ...current,
            statusTaskId: targetStatusId,
          });
        }
      }

      // dispatch(setTasks(updated));
      setActiveColumn(null);
    },
    [tasks, statuses, dispatch, user.token],
  );

  const handleFilterByPriority = () => {
    if (isSortedByPriority) {
      getAllTask(user.token, groupId, dispatch);
      setIsSortedByPriority(false);
    } else {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      const sortedTasks = [...tasks].sort((a, b) => {
        const pa = priorityOrder[a.priority] || 4;
        const pb = priorityOrder[b.priority] || 4;
        return pa - pb;
      });
      dispatch(setTasks(sortedTasks));
      setIsSortedByPriority(true);
    }
  };

  const handleShowAddTask = (status) => setShowAddTask(status);
  const handleShowComment = (task) => setShowCommentTask(task);
  const handleCloseComment = () => setShowCommentTask(null);
  const handleCloseAddStatus = () => setShowAddColumn(false);
  const handleChooseTask = (task) => setShowAddSubTask(task);
  const handleCloseAddSubtask = () => setShowAddSubTask(null);

  useEffect(() => {
    getStatus(user.token, groupId, dispatch);
    getAllTask(user.token, groupId, dispatch);
  }, [groupId]);

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check__task__by__list__container">
        {/* <ClassAndMember onFilterByPriority={handleFilterByPriority} /> */}

        <div className="check__task__by__list__column">
          {statuses.map((item) => {
            const colTasks = tasks.filter(
              (t) => String(t?.statusTaskId) === String(item.statusTaskId),
            );
            return (
              <SortableContext
                key={item.statusTaskId}
                items={colTasks.map((t) => t.taskId)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  statusId={item.statusTaskId}
                  status={item.statusTaskName}
                  color={item.statusTaskColor}
                  tasks={colTasks}
                  onShowAddTask={() => handleShowAddTask(item)}
                  onShowComment={handleShowComment}
                  onShowAddSubTask={handleChooseTask}
                  isLeader={matchRole}
                />
              </SortableContext>
            );
          })}

          {(user.role === 'LECTURER' || matchRole) && (
            <button className="btn_add_status" onClick={() => setShowAddColumn(!showAddColumn)}>
              <i className="fa-solid fa-plus" />
              <span>Add Status</span>
            </button>
          )}
        </div>

        {(user.role === 'LECTURER' || matchRole) && showAddTask && (
          <AddTask status={showAddTask} onCancel={() => setShowAddTask(null)} group={groupId} />
        )}

        {showCommentTask && <CommentTask task={showCommentTask} isClose={handleCloseComment} />}

        {showAddColumn && <AddColumn onCancel={handleCloseAddStatus} groupId={groupId} />}

        {showAddSubTask && <AddSubTask isClose={handleCloseAddSubtask} task={showAddSubTask} />}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '1' } },
          }),
        }}
      >
        {activeTask ? (
          <Task
            id={activeTask.taskId}
            title={activeTask.taskTitle}
            percent={activeTask.percentProgress}
            createdAt={activeTask.taskStartTime}
            dueDate={activeTask.taskDueDate}
            onShowComment={handleShowComment}
            onShowAddSubTask={handleChooseTask}
            isDraggingOverlay
            task={activeTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
      {/* AI Assistant floating button + modal (bottom-right) - visible only to group leader or lecturer */}
      {(user.role === 'LECTURER' || matchRole) && <ModalAI placement="bottom-right" />}
      </>
  );
};

export default CheckTypeByList;
