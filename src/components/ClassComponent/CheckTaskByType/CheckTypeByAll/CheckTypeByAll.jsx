import { useEffect, useState, useCallback } from "react";
import "./CheckTypeByAll.scss";
import Column from "./Column/Column";
import Task from "./Task/Task";
import {
  DndContext,
  rectIntersection,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import AddTask from "../../../Task/AddTask/AddTask";
import CommentTask from "../../../Task/CommentTask/CommentTask";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
import { useAuth } from "../../../../context/AuthProvider";
import taskService from "../../../../service/TaskService";
import statusApi from "../../../../service/ColumnService";
import GroupService from "../../../../service/GroupService";
import AddColumn from "../../../Column/AddColumn/AddColumn";
import axios from "axios";
import ReviewService from "../../../../service/ReviewService";
import AddSubTask from "../../../Task/AddSubTask/AddSubTask";
import decodeToken from "../../../../service/DecodeJwt";

const customCollisionDetection = (args) => {
  const droppableCollisions = rectIntersection(args) || [];
  if (droppableCollisions.length > 0) {
    return droppableCollisions;
  }
  const sortableCollisions = closestCorners(args) || [];
  return sortableCollisions.length > 0 ? sortableCollisions : null;
};

const CheckTypeByAll = () => {
  const { user } = useAuth();
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllTask, addTask, setSocket } = taskService();
  const { getAllStatus } = statusApi();
  const [statusTasks, setStatusTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [memberTask, setMemberTask] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [group, setGroup] = useState({});
  const { getAllGroup } = GroupService();
  const { getAllReview } = ReviewService();
  const [showAddSubTask, setShowAddSubTask] = useState(null);
  const decoded = decodeToken(user?.token);
  const idGroup = group.groupsId;
  console.log(idGroup)
  const isLeader = () => {
    if (group.groupsLeaderId === decoded.id) {
      return true;
    }

    return false;
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
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

      let updatedTasks = [...tasks];
      const activeIndex = tasks.findIndex((task) => task.taskId === activeId);

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

      updatedTasks = updatedTasks.map((task) =>
        task.taskId === activeId
          ? {
              ...task,
              statusTask: {
                ...task.statusTask,
                statusTaskId: targetStatusId,
                statusTaskName: targetStatus,
              },
            }
          : task
      );

      if (activeTask.statusTask.statusTaskId !== targetStatusId) {
        const newTask = {
          ...activeTask,
          statusTaskId: targetStatusId,
          listUserAssign: Array.isArray(activeTask.assigns)
            ? activeTask.assigns.map((user) => user.assignTo).filter(Boolean)
            : [],
        };
        try {
          const response = await addTask(newTask, user?.token);
          await axios.post("http://localhost:3000/notifications", {
            id: Math.random().toString(16).slice(2, 6),
            title: `Announcement for ${newTask.taskTitle} change to status`,
            author: {
              _id: Math.random(),
              name: user.username || "Unknown",
              avatar:
                user.avatar ||
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            },
            createdAt: new Date().toISOString().split("T")[0],
            isRead: false,
            _id: Math.random(),
          });
        } catch (error) {
          console.error("Failed to update task or send notification:", error);
        }
      }

      if (isOverDroppable) {
        const targetTasks = tasks.filter(
          (task) =>
            task?.statusTask?.statusTaskId === targetStatusId &&
            task.taskId !== activeId
        );
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.push({
          ...activeTask,
          statusTask: {
            ...activeTask.statusTask,
            statusTaskId: targetStatusId,
            statusTaskName: targetStatus,
          },
        });
      } else if (isOverTask) {
        const overTask = tasks.find((task) => task.taskId === over.id);
        const overIndex = tasks.findIndex((task) => task.taskId === over.id);
        if (activeTask?.statusTask?.statusTaskId === targetStatusId) {
          updatedTasks.splice(activeIndex, 1);
          updatedTasks.splice(overIndex, 0, activeTask);
        } else {
          updatedTasks.splice(activeIndex, 1);
          updatedTasks.splice(overIndex, 0, {
            ...activeTask,
            statusTask: {
              ...activeTask.statusTask,
              statusTaskId: targetStatusId,
              statusTaskName: targetStatus,
            },
          });
        }
      }

      setTasks(updatedTasks);
      setActiveColumn(null);
    },
    [tasks, activeColumn, statusTasks, addTask, user]
  );

  const handleFilterByPriority = () => {
    if (isSortedByPriority) {
      handleGetTasks();
      setIsSortedByPriority(false);
    } else {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      const sortedTasks = [...tasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        return priorityA - priorityB;
      });
      if (sortedTasks) {
        setTasks(sortedTasks);
        setIsSortedByPriority(true);
      }
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

  const handleGetStatusTask = useCallback(
    async (groupId) => {
      try {
        setStatusTasks([]);
        const response = await getAllStatus(user.token, groupId);
        if (response) {
          setStatusTasks(response.data);
        }
      } catch (e) {
        console.error(e.message);
      }
    },
    [user.token]
  );

  const handleColumnUpdated = useCallback(
    (updatedColumn) => {
      if (updatedColumn?.deleted) {
        setStatusTasks((prev) =>
          prev.filter(
            (status) => status.statusTaskId !== updatedColumn.statusId
          )
        );
      } else if (updatedColumn) {
        setStatusTasks((prev) => {
          const exists = prev.some(
            (status) => status.statusTaskId === updatedColumn.statusTaskId
          );
          if (exists) {
            return prev.map((status) =>
              status.statusTaskId === updatedColumn.statusTaskId
                ? { ...status, ...updatedColumn }
                : status
            );
          }
          return [...prev, updatedColumn];
        });
      } else {
        handleGetStatusTask(idGroup);
      }
    },
    [idGroup, handleGetStatusTask]
  );

  const handleGetTasks = useCallback(
    async (groupId) => {
      try {
        const response = await getAllTask(user.token, groupId);
        console.log('debug: ',response)
        if (response.data) {
          const normalizedTasks = response.data.map((task) => ({
            ...task,
            subtasks: task.subtasks || [],
            statusTask: {
              ...task.statusTask,
              statusTaskName: task.statusTask.statusTaskName
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            },
          }));
          console.log("normalizedTasks: ", normalizedTasks);
          setTasks(normalizedTasks);
        }
      } catch (e) {
        console.error(e.message);
      }
    },
    [user.token, idGroup]
  );

  const handleTaskUpdated = useCallback(
    (updatedTask) => {
      if (updatedTask?.deleted) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.taskId !== updatedTask.taskId)
        );
      } else if (updatedTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.taskId === updatedTask.taskId
              ? {
                  ...task,
                  ...updatedTask,
                  statusTask: {
                    ...task.statusTask,
                    statusTaskName: task.statusTask.statusTaskName
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase()),
                  },
                }
              : task
          )
        );
      } else {
        handleGetTasks(idGroup);
      }
    },
    [idGroup, handleGetTasks]
  );

  const handleChooseTask = async (task) => {
    setShowAddSubTask(task);
  };

  const handleCloseAddSubtask = async () => {
    setShowAddSubTask(null);
  };

  const handleDeleteReRender = (flag) => {
    if (flag) {
      if (showCommentTask) setShowCommentTask(null);
      if (showAddSubTask) setShowAddSubTask(null);
      handleGetTasks(idGroup);
    }
  };

  // useEffect(() => {
  //   const stompInstance = setSocket(user.token);
  //   setStompClient(stompInstance);
  //   stompInstance.onmessage = (message) => {
  //     const data = JSON.parse(message.body);
  //     if (data.type === "taskUpdate") {
  //       setTasks((prevTasks) => {
  //         const taskExists = prevTasks.some(
  //           (task) => task.taskId === data.taskId
  //         );
  //         if (taskExists) {
  //           return prevTasks.map((task) =>
  //             task.taskId === data.taskId
  //               ? {
  //                   ...task,
  //                   ...data,
  //                   statusTask: {
  //                     ...task.statusTask,
  //                     statusTaskName: data.statusTask.statusTaskName
  //                       .toLowerCase()
  //                       .replace(/\b\w/g, (c) => c.toUpperCase()),
  //                   },
  //                 }
  //               : task
  //           );
  //         } else {
  //           return [
  //             ...prevTasks,
  //             {
  //               ...data,
  //               statusTask: {
  //                 ...data.statusTask,
  //                 statusTaskName: data.statusTask.statusTaskName
  //                   .toLowerCase()
  //                   .replace(/\b\w/g, (c) => c.toUpperCase()),
  //               },
  //             },
  //           ];
  //         }
  //       });
  //     } else if (data.type === "taskDelete") {
  //       setTasks((prevTasks) =>
  //         prevTasks.filter((task) => task.taskId !== data.taskId)
  //       );
  //     }
  //   };
  //   return () => {
  //     if (stompInstance && stompInstance.connected) {
  //       stompInstance.disconnect();
  //     }
  //   };
  // }, [setSocket, user.token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          handleGetStatusTask(group.groupsId),
          handleGetTasks(group.groupsId),
        ]);
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
  }, [handleGetStatusTask, handleGetTasks, group.groupsId]);

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
          <ClassAndMember
            onFilterByPriority={handleFilterByPriority}
            setGroup={setGroup}
            setMemberTask={setMemberTask}
          />
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
                members={memberTask}
                onShowAddTask={() => handleShowAddTask(item)}
                onShowComment={handleShowComment}
                onShowAddSubTask={handleChooseTask}
                onColumnUpdated={handleColumnUpdated}
                handleDeleteReRender={handleDeleteReRender}
                isLeader={isLeader}
              />
            ))}
            {user.role === "LECTURER" || isLeader() ? (
              <button
                className="btn_add_status"
                onClick={() => setShowAddColumn(!showAddColumn)}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Status</span>
              </button>
            ) : null}
          </div>
          {user.role === "LECTURER" || isLeader()
            ? showAddTask && (
                <AddTask
                  status={showAddTask}
                  onCancel={() => setShowAddTask(null)}
                  group={group}
                  members={memberTask}
                  onTaskAdded={() => handleGetTasks(group.groupsId)}
                />
              )
            : null}
          {showCommentTask && (
            <CommentTask
              task={showCommentTask}
              isClose={handleCloseComment}
              handleDeleteReRender={handleDeleteReRender}
            />
          )}
          {showAddColumn && (
            <AddColumn
              status={showAddTask}
              onCancel={handleCloseAddStatus}
              group={group}
              members={memberTask}
              onColumnUpdated={handleColumnUpdated}
            />
          )}
          {showAddSubTask && (
            <AddSubTask
              isClose={handleCloseAddSubtask}
              task={showAddSubTask}
              members={memberTask}
              onSubTaskAdded={() => handleGetTasks(group.groupsId)}
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
            members={memberTask}
            percent={activeTask.percentProgress}
            onShowComment={handleShowComment}
            onShowAddSubTask={handleChooseTask}
            onTaskUpdated={handleTaskUpdated}
            isDraggingOverlay
            task={activeTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CheckTypeByAll;
