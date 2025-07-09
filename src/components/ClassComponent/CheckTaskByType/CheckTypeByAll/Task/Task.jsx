import React from "react";
import "./Task.scss";
import Skeleton from "react-loading-skeleton";
import iconMore from "../../../../../assets/icon/task/iconMore.png";
import iconDeadLine from "../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../assets/icon/avatar_add_button.png";
import iconDontKnow from "../../../../../assets/icon/task/iconDontKnow.png";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Task = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-container"
    >
      <div className="task-content">
        <div className="task-content-head">
          <span>{props.title || <Skeleton />}</span>
          <div className="task-content-head-icon">
            <i className="fa-solid fa-pen"></i>
            <i className="fa-solid fa-bookmark"></i>
            <i className="fa-solid fa-plus"></i>
            <img src={iconMore} alt="this is icon" />
          </div>
        </div>
        <div className="task-content-percent">
          <div
            className="task-content-percent-line"
            style={{ width: `${props.percent}` }}
          ></div>
          <span>{props.percent}</span>
        </div>
        <div className="task-content-deadline">
          <span>{formatDate(props.createdAt) || <Skeleton />}</span>
          <img src={iconDeadLine} alt="this is icon deadline" />
          <span>{formatDate(props.createdAt) || <Skeleton />}</span>
        </div>
        <div className="task-content-members">
          <ul
            className="task-content-members-student-list"
            data-extra-count={extraCount > 0 ? extraCount : ""}
          >
            {visibleMembers.map((item) => (
              <li key={item.assignTo}>
                <img src={item.img} alt="Student Avatar" />
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
                onClick={() => props.onShowComment(props.id)}
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

export default Task;
