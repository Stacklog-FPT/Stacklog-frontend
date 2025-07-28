import React, { useState } from "react";
import "./Task.scss";
import Skeleton from "react-loading-skeleton";
import iconDeadLine from "../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../assets/icon/avatar_add_button.png";
import iconDontKnow from "../../../../../assets/icon/task/iconDontKnow.png";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrashAlt } from "react-icons/fa";

const Task = ({ isDraggingOverlay, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: isDraggingOverlay });

  const style = {
    transform: isDraggingOverlay
      ? undefined
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
    transform: isDraggingOverlay ? "scale(1.03)" : undefined,
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

  // const taskData = {
  //   createdBy: props.task.createdBy,
  //   createdAt: props.task.createdAt,
  //   updateBy: props,
  //   updateAt: "2025-07-26T03:29:14.52073",
  //   taskId: "bb2c956b-7c31-4a98-9b2c-b99a5e71718a",
  //   taskTitle: "alo123",
  //   taskDescription: "123alo",
  //   groupId: "group_1",
  //   documentId: "",
  //   taskPoint: 0,
  //   taskDueDate: null,
  //   priority: "HIGH",
  //   statusTask: {
  //     createdBy: "user_2",
  //     createdAt: "2025-01-05T10:00:00",
  //     updateBy: "user_2",
  //     updateAt: "2025-01-06T10:00:00",
  //     statusTaskId: "a0a33333-3333-3333-3333-333333333333",
  //     statusTaskName: "To Do",
  //     statusTaskColor: "yellow",
  //     groupId: "group_1",
  //   },
  //   parentTask: null,
  // };

  return (
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
          <span>{props.title || <Skeleton />}</span>
          <div className="task-content-head-icon">
            <i className="fa-solid fa-pen"></i>
            <i className="fa-solid fa-bookmark"></i>
            <i className="fa-solid fa-plus"></i>
            <FaTrashAlt size={14} />
          </div>
        </div>
        <div className="task-content-percent">
          <div
            className="task-content-percent-line"
            style={{ width: `${props.percent}%` }}
          ></div>
          <span>{props.percent}%</span>
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
                onClick={() => props.onShowComment(props.task)}
              ></i>
              <span>8</span>
            </div>
            <div className="task-content-contact-left-element">
              <img src={iconDontKnow} alt="this is icon" />
              <span>8</span>
            </div>
          </div>
          <div className="task-content-contact-right"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Task);
