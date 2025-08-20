import { useState, useCallback, useEffect } from 'react';
import './CheckTypeByAll.scss';
import Column from './Column/Column';
import Task from './Task/Task';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
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

const CheckTypeByAll = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const statuses = useSelector((s) => s.status.statuses);
  const tasks = useSelector((t) => t.task.tasks);
  // const groups = useSelector((g) => g.group.groups);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [memberTask, setMemberTask] = useState([]);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [group, setGroup] = useState({});
  const [showAddSubTask, setShowAddSubTask] = useState(null);

  const isLeader = () => group.groupsLeaderId === user?.id;

  const updateTaskStatus = async (taskId, taskData) => {
    await updateTaskApi(taskId, taskData, user.token, dispatch);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = tasks.find((task) => task.taskId === active.id);
    setActiveTask(activeTask);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (over) {
      const overId = over.id;
      if (overId.startsWith('droppable-')) {
        const targetStatus = overId.replace('droppable-', '');
        setActiveColumn(targetStatus);
      }
    } else {
      setActiveColumn(null);
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
        console.log('No active task found for ID:', activeId);
        setActiveColumn(null);
        return;
      }

      // let updatedTasks = [...tasks];
      const activeIndex = tasks.findIndex((task) => task.taskId === activeId);

      const droppableId = over.id;
      const isOverDroppable = droppableId.startsWith('droppable-');
      const isOverTask = tasks.some((task) => task.taskId === over.id);

      let targetStatusId;
      let targetStatus;

      if (isOverDroppable) {
        targetStatusId = droppableId.replace('droppable-', '');
        targetStatus = statuses.find(
          (item) => item.statusTaskId === targetStatusId,
        )?.statusTaskName;
      } else if (isOverTask) {
        const overTask = tasks.find((task) => task.taskId === over.id);
        if (!overTask) {
          console.log('No over task found for ID:', over.id);
          setActiveColumn(null);
          return;
        }
        targetStatusId = overTask.statusTaskId;
        targetStatus = statuses.find(
          (item) => item.statusTaskId === targetStatusId,
        )?.statusTaskName;
      } else {
        setActiveColumn(null);
        return;
      }

      if (!targetStatusId || !targetStatus) {
        console.log('Invalid target status:', { targetStatusId, targetStatus });
        setActiveColumn(null);
        return;
      }
      if (isOverDroppable) {
        const taskData = {
          ...activeTask,
          statusTaskId: targetStatusId,
        };
        updateTaskStatus(activeTask.id, taskData);
        // updatedTasks = updatedTasks.filter((task) => task.taskId !== activeId);
        // updatedTasks.push({
        //   ...activeTask,
        //   statusTaskId: targetStatusId,
        //   statusTaskName: targetStatus,
        // });
      } else if (isOverTask) {
      }
      // } else if (isOverTask) {
      //   const overTask = tasks.find((task) => task.taskId === over.id);
      //   const overIndex = tasks.findIndex((task) => task.taskId === over.id);
      //   if (activeTask.statusTaskId === targetStatusId) {
      //     updatedTasks.splice(activeIndex, 1);
      //     updatedTasks.splice(overIndex, 0, activeTask);
      //   } else {
      //     updatedTasks = updatedTasks.filter((task) => task.taskId !== activeId);
      //     updatedTasks.splice(overIndex, 0, {
      //       ...activeTask,
      //       statusTaskId: targetStatusId,
      //       statusTaskName: targetStatus,
      //     });
      //   }
      // }
      // dispatch(setTasks(updatedTasks));
      setActiveColumn(null);
    },
    [tasks, statuses, dispatch],
  );

  const handleFilterByPriority = () => {
    if (isSortedByPriority) {
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
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check-task-by-all-container">
        <div className="check-task-by-all-content">
          <ClassAndMember
            onFilterByPriority={handleFilterByPriority}
            setGroup={setGroup}
            setMemberTask={setMemberTask}
          />
          <div className="task-column-container">
            {statuses.map((item) => (
              <Column
                key={item.statusTaskId}
                statusId={item.statusTaskId}
                status={item.statusTaskName}
                color={item.statusTaskColor}
                tasks={tasks.filter((task) => task?.statusTaskId === item.statusTaskId)}
                members={memberTask}
                onShowAddTask={() => handleShowAddTask(item)}
                onShowComment={handleShowComment}
                onShowAddSubTask={handleChooseTask}
                // onColumnUpdated={handleColumnUpdated}
                isLeader={isLeader}
              />
            ))}
            {user.role === 'LECTURER' || isLeader() ? (
              <button className="btn_add_status" onClick={() => setShowAddColumn(!showAddColumn)}>
                <i className="fa-solid fa-plus"></i>
                <span>Add Status</span>
              </button>
            ) : null}
          </div>
          {user.role === 'LECTURER' || isLeader()
            ? showAddTask && (
                <AddTask
                  status={showAddTask}
                  onCancel={() => setShowAddTask(null)}
                  group={groupId}
                  members={memberTask}
                />
              )
            : null}
          {showCommentTask && <CommentTask task={showCommentTask} isClose={handleCloseComment} />}
          {showAddColumn && (
            <AddColumn
              status={showAddTask}
              onCancel={handleCloseAddStatus}
              groupId={groupId}
              members={memberTask}
              // onColumnUpdated={handleColumnUpdated}
            />
          )}
          {showAddSubTask && (
            <AddSubTask
              isClose={handleCloseAddSubtask}
              task={showAddSubTask}
              members={memberTask}
              // onSubTaskAdded={() => handleGetTasks(groupId)}
            />
          )}
        </div>
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
            members={memberTask}
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

export default CheckTypeByAll;
