import { useState, useCallback, useEffect, useMemo } from "react";
import "./CheckTypeByAll.scss";
import Column from "./Column/Column";
import Task from "./Task/Task";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import AddTask from "../../../Task/AddTask/AddTask";
import CommentTask from "../../../Task/CommentTask/CommentTask";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
import { useAuth } from "../../../../context/AuthProvider";
import AddColumn from "../../../Column/AddColumn/AddColumn";
import AddSubTask from "../../../Task/AddSubTask/AddSubTask";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTasks } from "../../../../redux/slice/taskSlice";
import { getAllTask, updateTaskApi } from "../../../../service/TaskService";
import { getStatus } from "../../../../service/ColumnService";
import { isLeader } from "../../../../helper/validateStudentGroup";
import decodeToken from "../../../../service/DecodeJwt";
import ModalAI from "../../../ModalAI/ModalAI";
import { toast } from "sonner";

const CheckTypeByAll = () => {
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
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const uniqueStatuses = useMemo(() => {
    const map = new Map();
    statuses.forEach((st) => {
      if (!map.has(st.statusTaskId)) {
        map.set(st.statusTaskId, st);
      }
    });
    return Array.from(map.values());
  }, [statuses]);

  const updateTaskStatus = async (taskId, taskData) => {
    await updateTaskApi(taskData, user.token, dispatch);
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
    if (overId.startsWith("droppable-")) {
      const targetStatusId = overId.replace("droppable-", "");
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
      const isOverDroppable = droppableId.startsWith("droppable-");
      let targetStatusId;
      let targetStatus;

      if (isOverDroppable) {
        targetStatusId = droppableId.replace("droppable-", "");
      } else {
        // Check if over is a task
        const overTask = tasks.find((task) => task.taskId === droppableId);
        if (!overTask) {
          setActiveColumn(null);
          return;
        }
        targetStatusId = overTask.statusTaskId;
        targetStatus = statuses.find(
          (item) => item.statusTaskId === targetStatusId
        )?.statusTaskName;
      }

      if (!targetStatusId) {
        setActiveColumn(null);
        return;
      }

      // Prepare task data for update
      const taskData = {
        ...activeTask,
        statusTaskId: targetStatusId,
      };

      if (isOverDroppable) {
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
        const overIndex = tasks.findIndex(
          (task) => task.taskId === droppableId
        );
        if (activeTask.statusTaskId === targetStatusId) {
          // Same column: Reorder tasks
          updatedTasks.splice(activeIndex, 1);
          updatedTasks.splice(overIndex, 0, activeTask);
        } else {
          if (targetStatus.toLowerCase() === "completed" && !isLeader()) {
            toast.warning(
              "Only group leader can move task to Completed status."
            );
          } else {
            updateTaskStatus(activeTask.taskId, taskData);
            updatedTasks = updatedTasks.filter(
              (task) => task.taskId !== activeId
            );
            updatedTasks.splice(overIndex, 0, {
              ...activeTask,
              statusTaskId: targetStatusId,
              statusTaskName: targetStatus,
            });
          }
        }
      }

      dispatch(setTasks(updatedTasks));
      setActiveColumn(null);
    },
    [tasks, statuses, dispatch]
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
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="check-task-by-all-container">
          <div className="check-task-by-all-content">
            {/* <ClassAndMember onFilterByPriority={handleFilterByPriority} /> */}
            <div className="task-column-container">
              {uniqueStatuses.map((item) => (
                <Column
                  key={item.statusTaskId}
                  statusId={item.statusTaskId}
                  status={item.statusTaskName}
                  color={item.statusTaskColor}
                  tasks={tasks.filter(
                    (task) => task?.statusTaskId === item.statusTaskId
                  )}
                  onShowAddTask={() => handleShowAddTask(item)}
                  onShowComment={handleShowComment}
                  onShowAddSubTask={handleChooseTask}
                  isLeader={matchRole}
                />
              ))}
              {user.role === "LECTURER" || matchRole ? (
                <button
                  className="btn_add_status"
                  onClick={() => setShowAddColumn(!showAddColumn)}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Status</span>
                </button>
              ) : null}
            </div>
            {user.role === "LECTURER" || matchRole
              ? showAddTask && (
                  <AddTask
                    status={showAddTask}
                    onCancel={() => setShowAddTask(null)}
                    group={groupId}
                  />
                )
              : null}
            {showCommentTask && (
              <CommentTask
                task={showCommentTask}
                isClose={handleCloseComment}
              />
            )}
            {showAddColumn && (
              <AddColumn
                status={showAddTask}
                onCancel={handleCloseAddStatus}
                groupId={groupId}
              />
            )}
            {showAddSubTask && (
              <AddSubTask
                isClose={handleCloseAddSubtask}
                task={showAddSubTask}
              />
            )}
          </div>
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "1",
                },
              },
            }),
          }}
        >
          {activeTask ? (
            <Task
              id={activeTask.taskId}
              title={activeTask.taskTitle}
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
      {(user.role === "LECTURER" || matchRole) && (
        <ModalAI placement="bottom-right" />
      )}
    </>
  );
};

export default CheckTypeByAll;
