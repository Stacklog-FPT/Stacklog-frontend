import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import Skeleton from "react-loading-skeleton";
import iconDeadLine from "../../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../../assets/icon/avatar_add_button.png";
import "./SubTask.scss";

const SubTask = ({
  id,
  title,
  priority,
  createdAt,
  dueDate,
  startTime,
  members,
  taskId,
  subtask,
  onShowComment,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 0.2s ease, opacity 0.2s ease",
    opacity: isDragging ? 0.6 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  console.log(startTime)

  const visibleMembers = members?.slice(0, 3);
  const extraCount = members?.length - visibleMembers?.length;

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateRemainingPercent = (startTime, dueDate) => {
    const now = new Date();
    const start = new Date(startTime);
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

  const percentSubTask = calculateRemainingPercent(
    formatDate(createdAt),
    formatDate(dueDate)
  );

  const progressColor = getColorByPercent(percentSubTask);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`subtask-container ${isDragging ? "dragging" : ""}`}
      data-priority={priority}
    >
      <div className="subtask-content">
        <div className="subtask-content-head">
          <span title={title}>
            {title?.length > 5
              ? `${title.slice(0, 5)}...`
              : title || <Skeleton />}
          </span>
          <div className="subtask-content-head-icon">
            <FaPen className="icon" size={12} />
            <i
              className="fa-solid fa-bookmark"
              style={{
                color: priority === "HIGH" ? "#045745" : "inherit",
                cursor: "pointer",
              }}
            />
            <CiCirclePlus className="icon" size={14} />
            <FaTrashAlt className="icon" size={12} />
          </div>
        </div>
        <div className="subtask-content-percent">
          <div
            className="task-content-percent-line"
            style={{
              width: `${percentSubTask}%`,
              backgroundColor: progressColor,
              height: "5px",
            }}
          ></div>
          <span>{percentSubTask}%</span>
        </div>
        <div className="subtask-content-deadline">
          <span>{formatDate(startTime) || <Skeleton />}</span>
          <img
            src={iconDeadLine}
            alt="deadline icon"
            style={{ width: "5px", height: "5px" }}
          />
          <span>{formatDate(dueDate) || <Skeleton />}</span>
        </div>
        <div className="subtask-content-members">
          <ul
            className="subtask-content-members-student-list"
            data-extra-count={extraCount > 0 ? extraCount : ""}
          >
            {visibleMembers?.map((item, index) => (
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
            <img src={addButton} alt="add icon" />
          </button>
        </div>
        <div className="subtask-content-contact">
          <div className="subtask-content-contact-left">
            <div className="subtask-content-contact-left-element">
              <i
                className="fa-solid fa-comment"
                onClick={() => onShowComment(subtask)}
              ></i>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SubTask);
