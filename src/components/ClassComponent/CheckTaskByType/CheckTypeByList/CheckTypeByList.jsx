import React, { useEffect, useState, useCallback } from 'react';
import './CheckTypeByList.scss';
import Column from './Column/Column';
import Task from './Task/Task';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  rectIntersection,
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

const customCollisionDetection = (args) => {
  const droppableCollisions = rectIntersection(args) || [];
  if (droppableCollisions.length > 0) {
    return droppableCollisions;
  }
  const sortableCollisions = closestCorners(args) || [];
  return sortableCollisions.length > 0 ? sortableCollisions : null;
};

const CheckTypeByList = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const statuses = useSelector((s) => s.status.statuses);
  const tasks = useSelector((t) => t.task.tasks);
  const groupList = useSelector((state) => state.group.groups);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [showAddSubTask, setShowAddSubTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const checkIsLeader = () => {
    const currentGroup = groupList.find((g) => g.groupsId === groupId);
    if (isLeader(currentGroup, decodeToken(user.token).id)) {
      return true;
    }

    return false;
  };

  const updateTaskStatus = async (taskId, taskData) => {
    await updateTaskApi(taskId, taskData, user.token, dispatch);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = tasks.find((task) => task.taskId === active.id);
    setActiveTask(activeTask);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) return setActiveColumn(null);

    const overId = String(over.id);
    if (overId.startsWith('droppable-')) {
      const targetStatusId = overId.replace('droppable-', '');
      setActiveColumn(targetStatusId);
    } else {
      const overTask = tasks.find((t) => String(t.taskId) === overId);
      setActiveColumn(overTask ? overTask.statusTaskId : null);
    }
  };

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveTask(null);
      if (!over) {
        setActiveColumn(null);
        return;
      }
      const activeId = active.id;

      const activeTask = tasks.find((task) => task.taskId === activeId);
      if (!activeTask) {
        setActiveColumn(null);
        return;
      }

      let updatedTasks = [...tasks];
      const activeIndex = tasks.findIndex((task) => task.taskId === activeId);
      const droppableId = over.id;
      const isOverDroppable = droppableId.startsWith('droppable-');
      let targetStatusId;
      let targetStatus;

      if (isOverDroppable) {
        targetStatusId = droppableId.replace('droppable-', '');
        targetStatus = statuses.find(
          (item) => item.statusTaskId === targetStatusId,
        )?.statusTaskName;
      } else {
        const overTask = tasks.find((task) => task.taskId === droppableId);
        if (!overTask) {
          console.log('No over task found for ID:', droppableId);
          setActiveColumn(null);
          return;
        }
        targetStatusId = overTask.statusTaskId;
        targetStatus = statuses.find(
          (item) => item.statusTaskId === targetStatusId,
        )?.statusTaskName;
      }

      if (!targetStatusId) {
        console.log('Invalid target status:', { targetStatusId, targetStatus });
        setActiveColumn(null);
        return;
      }

      const taskData = {
        ...activeTask,
        statusTaskId: targetStatusId,
      };

      if (isOverDroppable) {
        // Dropped on empty column
        updateTaskStatus(activeTask.taskId, taskData);
        updatedTasks = updatedTasks.filter((task) => task.taskId !== activeId);
        updatedTasks.push({
          ...activeTask,
          statusTaskId: targetStatusId,
          statusTaskName: targetStatus,
        });
      } else {
        // Dropped on another task
        const overTask = tasks.find((task) => task.taskId === droppableId);
        const overIndex = tasks.findIndex((task) => task.taskId === droppableId);
        if (activeTask.statusTaskId === targetStatusId) {
          // Same column: Reorder tasks using arrayMove
          updatedTasks = arrayMove(updatedTasks, activeIndex, overIndex);
        } else {
          // Different column: Update status and insert at overIndex
          updateTaskStatus(activeTask.taskId, taskData);
          updatedTasks = updatedTasks.filter((task) => task.taskId !== activeId);
          updatedTasks.splice(overIndex, 0, {
            ...activeTask,
            statusTaskId: targetStatusId,
            statusTaskName: targetStatus,
          });
        }
      }

      dispatch(setTasks(updatedTasks));
      setActiveColumn(null);
    },
    [tasks, statuses, dispatch],
  );

  const handleFilterByPriority = () => {
    if (isSortedByPriority) {
      getAllTask(user.token, groupId, dispatch); // Assuming handleGetTasks is getAllTask
      setIsSortedByPriority(false);
    } else {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      const sortedTasks = [...tasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        return priorityA - priorityB;
      });
      dispatch(setTasks(sortedTasks));
      setIsSortedByPriority(true);
    }
  };

  const handleShowAddTask = (status) => {
    setShowAddTask(status);
  };

  const handleShowComment = (task) => {
    setShowCommentTask(task);
  };

  const handleCloseComment = () => {
    setShowCommentTask(null);
  };

  const handleCloseAddStatus = () => {
    setShowAddColumn(false);
  };

  const handleChooseTask = (task) => {
    setShowAddSubTask(task);
  };

  const handleCloseAddSubtask = () => {
    setShowAddSubTask(null);
  };

  useEffect(() => {
    getStatus(user.token, groupId, dispatch);
    getAllTask(user.token, groupId, dispatch);
  }, [groupId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check__task__by__list__container">
        <ClassAndMember onFilterByPriority={handleFilterByPriority} />
        <div className="check__task__by__list__column">
          {statuses.map((item) => (
            <SortableContext
              key={item.statusTaskId}
              items={tasks
                .filter((task) => task?.statusTaskId === item.statusTaskId)
                .map((task) => task.taskId)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                key={item.statusTaskId}
                statusId={item.statusTaskId}
                status={item.statusTaskName}
                color={item.statusTaskColor}
                tasks={tasks.filter((task) => task?.statusTaskId === item.statusTaskId)}
                onShowAddTask={() => handleShowAddTask(item)}
                onShowComment={handleShowComment}
                onShowAddSubTask={handleChooseTask}
                isLeader={checkIsLeader}
              />
            </SortableContext>
          ))}
          {user.role === 'LECTURER' || checkIsLeader() ? (
            <button className="btn_add_status" onClick={() => setShowAddColumn(!showAddColumn)}>
              <i className="fa-solid fa-plus"></i>
              <span>Add Status</span>
            </button>
          ) : null}
        </div>
        {user.role === 'LECTURER' || checkIsLeader()
          ? showAddTask && (
              <AddTask status={showAddTask} onCancel={() => setShowAddTask(null)} group={groupId} />
            )
          : null}
        {showCommentTask && <CommentTask task={showCommentTask} isClose={handleCloseComment} />}
        {showAddColumn && <AddColumn onCancel={handleCloseAddStatus} groupId={groupId} />}
        {showAddSubTask && <AddSubTask isClose={handleCloseAddSubtask} task={showAddSubTask} />}
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '1',
              },
            },
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
  );
};

export default CheckTypeByList;
