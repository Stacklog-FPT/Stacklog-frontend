import React from "react";
import Skeleton from "react-loading-skeleton";
import adjustIcon from "../../../../../../assets/icon/checkTaskByList/adjust.png";
import "./Subtask.scss";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Subtask = ({
  id,
  title,
  priority,
  percent,
  createdAt,
  dueDate,
  members = [],
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const visibleMembers = members?.slice(0, 3) || [];
  const extraCount = members?.length - visibleMembers.length;

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getColorByPercent = (percent) => {
    if (percent >= 70) return "#4caf50";
    if (percent >= 40) return "#ff9800";
    return "#f44336";
  };

  const progressColor = getColorByPercent(percent);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="subtask_row"
    >
      <td className="subtask-cell">
        <div className="task_list_head">
          <img src={adjustIcon} alt="Adjust Icon" />
          <div className="task_list_head_content">
            <h2>{title || <Skeleton />}</h2>
          </div>
        </div>
      </td>
      <td>
        <div className="task_list_member">
          <ul>
            {visibleMembers.map((item, index) => (
              <li key={index}>
                <img
                  src={
                    item.avatar ||
                    "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  }
                  alt="avatar"
                />
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
        <div className="task-content-percent">
          <div className="task-content-percent-container">
            <div
              className="task-content-percent-line"
              style={{ width: `${percent}%`, backgroundColor: progressColor }}
            ></div>
          </div>
          <span>{percent}%</span>
        </div>
      </td>
      <td>
        <div className="task_list_priority">
          <h2>{priority}</h2>
        </div>
      </td>
      <td></td>
    </tr>
  );
};

export default React.memo(Subtask);
