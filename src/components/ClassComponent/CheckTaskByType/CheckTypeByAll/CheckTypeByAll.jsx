import { useEffect, useState } from "react";
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
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllTask } = taskService();
  const { getAllStatus } = statusApi();
  const [statusTasks, setStatusTasks] = useState([]);
  (statusTasks);
  const [tasks, setTasks] = useState([]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const activeTask = tasks.find((task) => task.taskId === activeId);
    if (!activeTask) return;

    let updatedTasks = [...tasks];
    const activeIndex = tasks.findIndex((task) => task.taskId === activeId);

    const droppableId = over.id;
    const isOverDroppable = droppableId.startsWith("droppable-");
    const isOverTask = tasks.some((task) => task.taskId === over.id);

    if (isOverDroppable || activeColumn) {
      const targetStatus =
        activeColumn || droppableId.replace("droppable-", "");
      const targetTasks = tasks.filter(
        (task) =>
          task?.statusTask?.statusTaskName === targetStatus &&
          task.taskId !== activeId
      );
      let dropIndex = over.data.current?.sortable?.index ?? 0;

      updatedTasks = updatedTasks.map((task) =>
        task.taskId === activeId
          ? {
              ...task,
              statusTask: { ...task.statusTask, statusTaskName: targetStatus },
            }
          : task
      );

      let targetIndex = 0;
      if (targetTasks.length === 0) {
        const firstTaskInOtherColumn = tasks.findIndex(
          (task) => task?.statusTask?.statusTaskName === targetStatus
        );
        targetIndex =
          firstTaskInOtherColumn === -1 ? tasks.length : firstTaskInOtherColumn;
      } else {
        targetIndex =
          tasks.findIndex(
            (task) => task?.statusTask?.statusTaskName === targetStatus
          ) + dropIndex;
      }

      updatedTasks.splice(activeIndex, 1);
      updatedTasks.splice(targetIndex, 0, {
        ...activeTask,
        statusTask: { ...activeTask.statusTask, statusTaskName: targetStatus },
      });
    } else if (isOverTask) {
      const overTask = tasks.find((task) => task.taskId === over.id);
      if (!overTask) return;

      const overIndex = tasks.findIndex((task) => task.taskId === over.id);
      const targetStatus = overTask?.statusTask?.statusTaskName;

      if (activeTask?.statusTask?.statusTaskName === targetStatus) {
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, activeTask);
      } else {
        updatedTasks = updatedTasks.map((task) =>
          task.taskId === activeId
            ? {
                ...task,
                statusTask: {
                  ...task.statusTask,
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
            statusTaskName: targetStatus,
          },
        });
      }
    }
    setTasks(updatedTasks);
    setActiveColumn(null);
  };

  const handleShowAddTask = (status) => {
    setShowAddTask(status);
  };

  const handleShowComment = (taskId) => {
    setShowCommentTask(taskId);
  };

  const handleCloseComment = () => {
    setShowCommentTask(null);
  };

  const handleGetStatusTask = async () => {
    try {
      const response = await getAllStatus(user.token);
      if (response) {
        (response);
        setStatusTasks(response.data);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleGetTasks = async () => {
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
        const uniqueMembers = [
          ...new Map(
            normalizedTasks
              .flatMap((task) => task.assigns)
              .map((member) => [member.assignTo, member])
          ).values(),
        ];
        setMembers(uniqueMembers);
      }
    } catch (e) {
      console.error(e.message);
    }
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

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setShowAddTask(null);
      }
    });

    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          setShowAddTask(null);
        }
      });
    };
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
                status={item.statusTaskName}
                color={item.statusTaskColor}
                isLoading={isLoading}
                tasks={tasks.filter(
                  (task) =>
                    task?.statusTask?.statusTaskName === item.statusTaskName
                )}
                members={members}
                onShowAddTask={() => handleShowAddTask(item.statusTaskName)}
                onShowComment={handleShowComment}
              />
            ))}
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
        </div>
      </div>
    </DndContext>
  );
};

export default CheckTypeByAll;
