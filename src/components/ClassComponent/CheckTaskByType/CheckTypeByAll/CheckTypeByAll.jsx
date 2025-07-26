import { useEffect, useState, useCallback } from "react";
import "./CheckTypeByAll.scss";
import Column from "./Column/Column";
import { DndContext, rectIntersection, closestCorners } from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import AddTask from "../../../Task/AddTask/AddTask";
import CommentTask from "../../../Task/CommentTask/CommentTask";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
import { useAuth } from "../../../../context/AuthProvider";
import taskService from "../../../../service/TaskService";
import statusApi from "../../../../service/ColumnService";
import GroupService from "../../../../service/GroupService";
import AddColumn from "../../../Column/AddColumn/AddColumn";

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
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCommentTask, setShowCommentTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllTask, addTask, setSocket } = taskService();
  const { getAllStatus } = statusApi();
  const [statusTasks, setStatusTasks] = useState([]);
  console.log("statusTask: ", statusTasks);
  const [tasks, setTasks] = useState([]);
  console.log(tasks);
  const [stompClient, setStompClient] = useState(null);
  const { getAllGroup } = GroupService();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getStatusIdByName = (statusName) => {
    const status = statusTasks.find(
      (item) => item.statusTaskName === statusName
    );
    return status?.statusTaskId || null;
  };

  const handleDragOver = (event) => {
    const { over } = event;
    console.log("handleDragOver triggered:", { over });
    if (over) {
      const overId = over.id;
      console.log("overId:", overId);
      if (overId.startsWith("droppable-")) {
        const targetStatus = overId.replace("droppable-", "");
        console.log("Setting activeColumn to:", targetStatus);
        setActiveColumn(targetStatus);
      } else {
        console.log("overId does not start with 'droppable-':", overId);
      }
    } else {
      console.log("No over element, clearing activeColumn");
      setActiveColumn(null);
    }
  };

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) {
        console.log("No over element, returning early");
        return;
      }
      const activeId = active.id;
      const activeTask = tasks.find((task) => task.taskId === activeId);
      console.log("activeId:", activeId, "activeTask:", activeTask);
      if (!activeTask) {
        console.error("Active task not found");
        return;
      }

      let updatedTasks = [...tasks];
      const activeIndex = tasks.findIndex((task) => task.taskId === activeId);

      const droppableId = over.id;
      const isOverDroppable = droppableId.startsWith("droppable-");
      const isOverTask = tasks.some((task) => task.taskId === over.id);

      if (isOverDroppable || activeColumn) {
        const targetStatusId =
          activeColumn || droppableId.replace("droppable-", "");
        console.log("targetStatusId:", targetStatusId);
        const targetStatus = statusTasks.find(
          (item) => item.statusTaskId === targetStatusId
        )?.statusTaskName;
        console.log("targetStatus:", targetStatus);
        if (!targetStatusId || !targetStatus) {
          console.error("Target status not found for ID:", targetStatusId);
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
            statusTask: {
              ...activeTask.statusTask,
              statusTaskId: targetStatusId,
              statusTaskName: targetStatus,
            },
          };
          addTask(newTask, user?.token)
            .then(() => console.log("Task updated in backend:", newTask))
            .catch((error) => console.error("Failed to update task:", error));
        }

        const targetTasks = tasks.filter(
          (task) =>
            task?.statusTask?.statusTaskId === targetStatusId &&
            task.taskId !== activeId
        );
        let dropIndex = over.data.current?.sortable?.index ?? 0;
        let targetIndex = 0;

        if (targetTasks.length === 0) {
          const firstTaskInOtherColumn = tasks.findIndex(
            (task) => task?.statusTask?.statusTaskId === targetStatusId
          );
          targetIndex =
            firstTaskInOtherColumn === -1
              ? tasks.length
              : firstTaskInOtherColumn;
        } else {
          targetIndex =
            tasks.findIndex(
              (task) => task?.statusTask?.statusTaskId === targetStatusId
            ) + dropIndex;
        }

        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(targetIndex, 0, {
          ...activeTask,
          statusTask: {
            ...activeTask.statusTask,
            statusTaskId: targetStatusId,
            statusTaskName: targetStatus,
          },
        });
      } else if (isOverTask) {
        console.log("Task dropped over another task");
        const overTask = tasks.find((task) => task.taskId === over.id);
        if (!overTask) {
          console.error("Over task not found:", over.id);
          return;
        }

        const overIndex = tasks.findIndex((task) => task.taskId === over.id);
        const targetStatusId = overTask?.statusTask?.statusTaskId;
        const targetStatus = overTask?.statusTask?.statusTaskName;

        if (activeTask?.statusTask?.statusTaskId === targetStatusId) {
          updatedTasks.splice(activeIndex, 1);
          updatedTasks.splice(overIndex, 0, activeTask);
        } else {
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
      } else {
        console.log("Dropped on invalid target");
      }
      setTasks(updatedTasks);
      setActiveColumn(null);
    },
    [tasks, activeColumn]
  );

  const handleShowAddTask = (status) => {
    setShowAddTask(status);
  };

  const handleShowComment = (taskId) => {
    setShowCommentTask(taskId);
  };

  const handleCloseComment = () => {
    setShowCommentTask(null);
  };

  const handleCloseAddStatus = () => {
    setShowAddColumn(false);
  };

  const handleGetStatusTask = useCallback(async () => {
    try {
      const response = await getAllStatus(user.token);
      if (response) {
        setStatusTasks(response.data);
      }
    } catch (e) {
      console.error(e.message);
    }
  }, []);
  //user.token, getAllStatus
  const handleGetTasks = useCallback(async () => {
    try {
      const response = await getAllTask(user.token);
      if (response) {
        const normalizedTasks = response.data.map((task) => ({
          ...task,
          statusTask: {
            ...task.statusTask,
            statusTaskName: task.statusTask.statusTaskName
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          },
        }));
        setTasks(normalizedTasks);
        // const uniqueMembers = [
        //   ...new Map(
        //     normalizedTasks
        //       .flatMap((task) => task.assigns)
        //       .map((member) => [member.assignTo, member])
        //   ).values(),
        // ];
        // setMembers(uniqueMembers);
      }
    } catch (e) {
      console.error(e.message);
    }
  }, []);
  //user.token, getAllTask

  const handleGetGroupList = async () => {
    try {
      const response = await getAllGroup(user?.token);

      if (response) {
        setMembers(response?.users);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };
  useEffect(() => {
    const stompInstance = setSocket(user.token);
    setStompClient(stompInstance);
    stompInstance.onmessage = (message) => {
      const data = JSON.parse(message.body);

      if (data.type === "taskUpdate") {
        setTasks((prevTasks) => {
          const taskExists = prevTasks.some(
            (task) => task.taskId === data.taskId
          );
          if (taskExists) {
            return prevTasks.map((task) =>
              task.taskId === data.taskId
                ? {
                    ...task,
                    ...data,
                    statusTask: {
                      ...task.statusTask,
                      statusTaskName: data.statusTask.statusTaskName
                        .toLowerCase()
                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                    },
                  }
                : task
            );
          } else {
            return [
              ...prevTasks,
              {
                ...data,
                statusTask: {
                  ...data.statusTask,
                  statusTaskName: data.statusTask.statusTaskName
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
                },
              },
            ];
          }
        });
      } else if (data.type === "taskDelete") {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.taskId !== data.taskId)
        );
      }
    };

    return () => {
      if (stompInstance && stompInstance.connected) {
        stompInstance.disconnect();
      }
    };
  }, []);
  // user.token, setSocket

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
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check-task-by-all-container">
        <div className="check-task-by-all-content">
          <ClassAndMember />
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
                onShowAddTask={() => handleShowAddTask(item)}
                onShowComment={handleShowComment}
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
              taskId={showCommentTask}
              isClose={handleCloseComment}
            />
          )}
          {showAddColumn && <AddColumn isClose={handleCloseAddStatus} />}
        </div>
      </div>
    </DndContext>
  );
};

export default CheckTypeByAll;
