import React, { useEffect, useState, useCallback } from "react";
import "./CheckTypeByList.scss";
import Column from "./Column/Column";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
import {
  DndContext,
  rectIntersection,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import AddTask from "../../../Task/AddTask/AddTask";
import CommentTask from "../../../Task/CommentTask/CommentTask";
import AddColumn from "../../../Column/AddColumn/AddColumn";
import AddSubTask from "../../../Task/AddSubTask/AddSubTask";
import taskService from "../../../../service/TaskService";
import statusApi from "../../../../service/ColumnService";
import GroupService from "../../../../service/GroupService";
import ReviewService from "../../../../service/ReviewService";
import { useAuth } from "../../../../context/AuthProvider";
import axios from "axios";
import Task from "./Task/Task";

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
  const { getAllTask, addTask } = taskService();
  const { getAllStatus } = statusApi();
  const { getAllGroup } = GroupService();
  const { getAllReview } = ReviewService();
  const [statusTasks, setStatusTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [comments, setComments] = useState([]);
  const [showAddSubTask, setShowAddSubTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Khớp với CheckTypeByAll
      },
    })
  );

  const calculateProgress = (createdAt, dueDate) => {
    if (!createdAt || !dueDate) return 0;

    const created = new Date(createdAt);
    const due = new Date(dueDate);
    const now = new Date();

    if (isNaN(created) || isNaN(due)) return 0;
    if (now >= due) return 100;
    if (now <= created) return 0;

    const totalTime = due.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    const percent = (elapsedTime / totalTime) * 100;

    return Math.min(Math.max(Math.round(percent), 0), 100);
  };

  const handleGetTasks = useCallback(async () => {
    try {
      const response = await getAllTask(user?.token);
      if (response) {
        const normalizedTasks = response.data.map((task) => ({
          ...task,
          statusTask: {
            ...task.statusTask,
            statusTaskName: task.statusTask.statusTaskName
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          },
          percentProgress: calculateProgress(task.createdAt, task.taskDueDate),
        }));
        setTasks(normalizedTasks);
      }
    } catch (e) {
      console.error("Failed to fetch tasks:", e.message);
    }
  }, [user?.token, getAllTask]);

  const handleGetStatusTask = useCallback(async () => {
    try {
      const response = await getAllStatus(user?.token);
      if (response) {
        setStatusTasks(response.data);
      }
    } catch (e) {
      console.error("Error fetching statuses:", e.message);
    }
  }, [user?.token, getAllStatus]);

  const handleGetGroupList = useCallback(async () => {
    try {
      const response = await getAllGroup(user?.token);
      if (response) {
        setMembers(response?.users || []);
      }
    } catch (e) {
      console.error("Error fetching group list:", e.message);
    }
  }, [user?.token, getAllGroup]);

  const handleGetCommentTask = useCallback(async (taskId) => {
    try {
      const response = await getAllReview(user?.token, taskId);
      if (response && response.data) {
        setComments(response.data);
      }
    } catch (e) {
      console.error("Error fetching comments:", e.message);
    }
  }, [user?.token, getAllReview]);

  const handleFilterByPriority = useCallback(() => {
    setIsSortedByPriority((prev) => {
      if (prev) {
        handleGetTasks();
        return false;
      } else {
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        const sortedTasks = [...tasks].sort((a, b) => {
          const priorityA = priorityOrder[a.priority] || 4;
          const priorityB = priorityOrder[b.priority] || 4;
          return priorityA - priorityB;
        });
        setTasks(sortedTasks);
        return true;
      }
    });
  }, [tasks, handleGetTasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = tasks.find((task) => task.taskId === active.id);
    setActiveTask(activeTask);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (over) {
      const overId = over.id;
      if (overId.startsWith("droppable-")) {
        const targetStatus = overId.replace("droppable-", "");
        setActiveColumn(targetStatus);
      }
    } else {
      setActiveColumn(null);
    }
  };

  const handleDragEnd = useCallback(
    async (event) => {
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

      const droppableId = over.id;
      const isOverDroppable = droppableId.startsWith("droppable-");
      const isOverTask = tasks.some((task) => task.taskId === over.id);

      let targetStatusId;
      let targetStatus;

      if (isOverDroppable) {
        targetStatusId = droppableId.replace("droppable-", "");
        targetStatus = statusTasks.find(
          (item) => item.statusTaskId === targetStatusId
        )?.statusTaskName;
      } else if (isOverTask) {
        const overTask = tasks.find((task) => task.taskId === over.id);
        if (!overTask) {
          setActiveColumn(null);
          return;
        }
        targetStatusId = overTask?.statusTask?.statusTaskId;
        targetStatus = overTask?.statusTask?.statusTaskName;
      } else {
        setActiveColumn(null);
        return;
      }

      if (!targetStatusId || !targetStatus) {
        setActiveColumn(null);
        return;
      }

      if (activeTask.statusTask.statusTaskId !== targetStatusId) {
        const newTask = {
          ...activeTask,
          statusTask: {
            ...activeTask.statusTask,
            statusTaskId: targetStatusId,
            statusTaskName: targetStatus,
          },
          listUserAssign: [
            "6801ccf3b8b39cd0e4d38877",
            "68768017c89a12a7e51ddebd",
          ],
        };
        try {
          await addTask(newTask, user?.token);
          await axios.post("http://localhost:3000/notifications", {
            id: Math.random().toString(16).slice(2, 6),
            title: `Thông báo môn ${newTask.taskTitle}`,
            author: {
              _id: Math.random(),
              name: user?.username || "Unknown",
              avatar:
                user?.avatar ||
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            },
            createdAt: new Date().toISOString().split("T")[0],
            isRead: false,
            _id: Math.random(),
          });
          await handleGetTasks();
        } catch (error) {
          console.error("Failed to update task or send notification:", error);
        }
      } else if (isOverTask) {
        const overTask = tasks.find((task) => task.taskId === over.id);
        const overIndex = tasks.findIndex((task) => task.taskId === over.id);
        const activeIndex = tasks.findIndex((task) => task.taskId === activeId);
        const updatedTasks = [...tasks];
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, activeTask);
        setTasks(updatedTasks);
      }

      setActiveColumn(null);
    },
    [tasks, statusTasks, addTask, user?.token, handleGetTasks]
  );

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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([handleGetStatusTask(), handleGetTasks()]);
      } catch (e) {
        console.error("Error fetching data:", e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowAddTask(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleGetStatusTask, handleGetTasks]);

  useEffect(() => {
    handleGetGroupList();
  }, [handleGetGroupList]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check-task-by-all-container">
        <div className="check-task-by-all-content">
          <ClassAndMember onFilterByPriority={handleFilterByPriority} />
          <div className="task-column-container">
            {statusTasks.map((item) => (
              <Column
                key={item.statusTaskId}
                statusId={item.statusTaskId}
                status={item.statusTaskName}
                color={item.statusTaskColor}
                isLoading={isLoading}
                tasks={tasks.filter(
                  (task) => task?.statusTask?.statusTaskId === item.statusTaskId
                )}
                members={members}
                commentsLen={comments}
                onShowAddTask={() => handleShowAddTask(item)}
                onShowComment={handleShowComment}
                onShowAddSubTask={handleChooseTask}
              />
            ))}
            <button
              className="btn_add_status"
              onClick={() => setShowAddColumn(!showAddColumn)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Status</span>
            </button>
          </div>
          {showAddTask && (
            <AddTask
              status={showAddTask}
              onCancel={() => setShowAddTask(null)}
              members={members}
            />
          )}
          {showCommentTask && (
            <CommentTask
              task={showCommentTask}
              isClose={handleCloseComment}
              comments={comments}
              onGetComments={handleGetCommentTask}
            />
          )}
          {showAddColumn && <AddColumn isClose={handleCloseAddStatus} />}
          {showAddSubTask && (
            <AddSubTask isClose={handleCloseAddSubtask} task={showAddSubTask} />
          )}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <Task
            id={activeTask.taskId}
            title={activeTask.taskTitle}
            percent={activeTask.percentProgress}
            members={members}
            createdAt={activeTask.createdAt}
            dueDate={activeTask.taskDueDate}
            priority={activeTask.priority}
            onShowComment={handleShowComment}
            onShowAddSubTask={handleChooseTask}
            task={activeTask}
            commentsLen={comments}
            isDraggingOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default React.memo(CheckTypeByList);