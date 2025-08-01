import React, { useState, useEffect } from "react";
import "./Task.scss";
import Skeleton from "react-loading-skeleton";
import iconDeadLine from "../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../assets/icon/avatar_add_button.png";
import iconDontKnow from "../../../../../assets/icon/task/iconDontKnow.png";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrashAlt } from "react-icons/fa";
import taskService from "../../../../../service/TaskService";
import { useAuth } from "../../../../../context/AuthProvider";
import SubTask from "./SubTask/SubTask";
import { FaPlus } from "react-icons/fa";

const Task = ({ isDraggingOverlay, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: isDraggingOverlay });
  const { user } = useAuth();
  const [showSubTask, setShowSubTask] = useState(false);
  const { addTask } = taskService();
  const [isAddSubTask, setIsAddSubTask] = useState(false);
  const style = {
    transform: isDraggingOverlay
      ? "scale(1.03)"
      : CSS.Transform.toString(transform),
    transition: isDraggingOverlay
      ? undefined
      : transition || "transform 0.2s ease, opacity 0.2s ease",
    opacity:
      isDragging && !isDraggingOverlay ? 0.4 : isDraggingOverlay ? 0.9 : 1,
    zIndex: isDraggingOverlay ? 1000 : isDragging ? 500 : 1,
    boxShadow: isDraggingOverlay ? "0 8px 24px rgba(0, 0, 0, 0.3)" : "none",
    cursor: isDraggingOverlay ? "grabbing" : isDragging ? "grabbing" : "grab",
    width: isDraggingOverlay ? "260px" : undefined,
  };

  const visibleMembers = props?.members?.slice(0, 3);
  const extraCount = props?.members?.length - visibleMembers?.length;

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEditPriority = async (task) => {
    try {
      const newPriority =
        task?.priority === "HIGH"
          ? "MEDIUM"
          : task?.priority === "MEDIUM"
          ? "LOW"
          : "HIGH";
      const payload = {
        taskId: task.taskId,
        groupId: task.groupId,
        taskTitle: task.taskTitle,
        taskDescription: task.taskDescription,
        documentId: task.documentId,
        taskPoint: task.taskPoint,
        taskParentId: "",
        dueDate: "",
        createdBy: task.createdBy,
        updatedBy: task.updatedBy,
        priority: newPriority,
        statusTask: {
          createdBy: task.statusTask.createdBy,
          createdAt: task.statusTask.createdAt,
          updateBy: task.statusTask.updateBy,
          updateAt: task.statusTask.updateAt,
          statusTaskId: task.statusTask.statusTaskId,
          statusTaskName: task.statusTask.statusTaskName,
          statusTaskColor: task.statusTask.statusTaskColor,
          groupId: task.statusTask.groupId,
        },
        listUserAssign: [
          "6801ccf3b8b39cd0e4d38877",
          "68768017c89a12a7e51ddebd",
        ],
        subtasks: task?.subtasks,
      };
      const response = await addTask(payload, user?.token);
      if (response) {
        console.log("Updated task:", response);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const handleShowSubTask = () => {
    setShowSubTask(!showSubTask);
  };

  const calculateRemainingPercent = (createdAt, dueDate) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(dueDate);

    if (isNaN(start) || isNaN(end) || end <= start) return 0;

    const totalDuration = end - start;
    const remainingDuration = end - now;

    const percent = (remainingDuration / totalDuration) * 100;

    return Math.max(0, Math.min(100, Math.round(percent)));
  };

  const getColorByPercent = (percent) => {
    if (percent >= 70) return "#4caf50";
    if (percent >= 40) return "#ff9800";
    return "#f44336";
  };

  const percent = calculateRemainingPercent(props.createdAt, props.dueDate);
  const progressColor = getColorByPercent(percent);

  return (
    <>
      <div
        ref={isDraggingOverlay ? null : setNodeRef}
        style={style}
        {...(isDraggingOverlay ? {} : attributes)}
        {...(isDraggingOverlay ? {} : listeners)}
        className={`task-container ${isDragging ? "dragging" : ""} ${
          isDraggingOverlay ? "overlay" : ""
        }`}
      >
        <div className="task-content">
          <div className="task-content-head">
            <span>
              {props.title?.length > 10
                ? `${props.title.slice(0, 10)}...`
                : props.title || <Skeleton />}
            </span>
            <div className="task-content-head-icon">
              <i className="fa-solid fa-pen" />
              <i
                className="fa-solid fa-bookmark"
                style={{
                  color:
                    props?.task?.priority === "HIGH" ? "#045745" : "inherit",
                  cursor: "pointer",
                }}
                onClick={() => handleEditPriority(props.task)}
              />
              <FaPlus
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => props.onShowAddSubTask(props.task)}
              />
              <FaTrashAlt size={12} style={{ cursor: "pointer" }} />
            </div>
          </div>
          <div className="task-content-percent">
            <div
              className="task-content-percent-line"
              style={{ width: `${percent}%`, backgroundColor: progressColor }}
            ></div>
            <span>{percent}%</span>
          </div>

          <div className="task-content-deadline">
            <span>{formatDate(props.createdAt) || <Skeleton />}</span>
            <img src={iconDeadLine} alt="this is icon deadline" />
            <span>{formatDate(props.dueDate) || <Skeleton />}</span>
          </div>
          <div className="task-content-members">
            <ul
              className="task-content-members-student-list"
              data-extra-count={extraCount > 0 ? extraCount : ""}
            >
              {visibleMembers.map((item, index) => (
                <li key={index}>
                  <img
                    src={
                      item.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt="Student Avatar"
                  />
                </li>
              ))}
              {extraCount > 0 && (
                <li className="extra-count">
                  <span>+{extraCount}</span>
                </li>
              )}
            </ul>
            <button>
              <img src={addButton} alt="this is icon" />
            </button>
          </div>
          <div className="task-content-contact">
            <div className="task-content-contact-left">
              <div className="task-content-contact-left-element">
                <i
                  className="fa-solid fa-comment"
                  onClick={() => props.onShowComment(props.task?.taskId)}
                ></i>
                <span>{props.commentLength}</span>
              </div>
              <div
                className="task-content-contact-left-element"
                style={{ cursor: "pointer" }}
                onClick={handleShowSubTask}
              >
                <img src={iconDontKnow} alt="this is icon" />
                <span>{props.task?.subtasks?.length || 0}</span>
              </div>
            </div>
            <div className="task-content-contact-right"></div>
          </div>
        </div>
      </div>
      <div className="task-content-subtask">
        {showSubTask &&
          (props.task.subtasks?.length > 0 ? (
            <SortableContext
              items={props.task?.subtasks.map(
                (subtask) => `${props.task.taskId}-subtask-${subtask.subtaskId}`
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className="subtask-list">
                {props.task.subtasks.map((item) => (
                  <SubTask
                    key={`${props.task.taskId}-subtask-${item.subtaskId}`}
                    id={`${props.task.taskId}-subtask-${item.subtaskId}`}
                    title={item.taskTitle}
                    priority={item.priority}
                    percent={item.percent}
                    createdAt={item.createdAt}
                    dueDate={item.dueDate}
                    members={item.assigns}
                    taskId={props.task.taskId}
                    subtask={item}
                    reviews={item.reviews}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <h2>No available subtasks</h2>
          ))}
      </div>
    </>
  );
};

export default React.memo(Task);
