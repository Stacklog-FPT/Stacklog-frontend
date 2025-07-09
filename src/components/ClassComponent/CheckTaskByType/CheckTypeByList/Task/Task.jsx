import React from "react";
import "./Task.scss";
import adjustIcon from "../../../../../assets/icon/checkTaskByList/adjust.png";
import { useSortable } from "@dnd-kit/sortable";
import Skeleton from "react-loading-skeleton";
import { CSS } from "@dnd-kit/utilities";

const Task = ({ id, title, members, dueDate, priority, onShowComment }) => {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFormatDate = (date) => {
    if (!date) return "";

    const dateObj = new Date(date);
    if (isNaN(dateObj)) return "";

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const visibleMembers = members?.slice(0, 3) || [];
  const extraCount = members?.length - visibleMembers.length;
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task_list_container"
    >
      <td>
        <div className="task_list_head">
          <img src={adjustIcon} alt="Adjust Icon" />
          <div className="task_list_head_content">
            <p>.</p>
            <h2>{title || <Skeleton/>}</h2>
          </div>
        </div>
      </td>
      <td>
        <div className="task_list_member">
          <ul
            className="task-content-members-student-list"
            data-extra-count={extraCount > 0 ? extraCount : ""}
          >
            {visibleMembers.map((item) => (
              <li key={item.id}>
                <img src={item.img} alt="Student Avatar" />
              </li>
            ))}
            {extraCount > 0 && (
              <li className="extra-count">
                <span>+{extraCount}</span>
              </li>
            )}
          </ul>
        </div>
      </td>
      <td>
        <div className="task_list_due_date">
          <h2>{handleFormatDate(dueDate) || "No due date"}</h2>
        </div>
      </td>
      <td>
        <div className="task_list_priority">
          <h2>{priority || "No priority"}</h2>
        </div>
      </td>
      <td>
        <div className="task_list_action">
          <img
            src={adjustIcon}
            alt="Action Icon"
            onClick={() => onShowComment?.(id)}
          />
        </div>
      </td>
    </tr>
  );
};

export default Task;
