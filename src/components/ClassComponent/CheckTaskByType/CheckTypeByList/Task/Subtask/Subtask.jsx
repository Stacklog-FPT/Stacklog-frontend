// Subtask.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import adjustIcon from "../../../../../../assets/icon/checkTaskByList/adjust.png";
import "./Subtask.scss";
import { TbSubtask } from "react-icons/tb";
import { FaComment } from "react-icons/fa";

const Subtask = ({
  title,
  priority,
  percent,
  createdAt,
  dueDate,
  members = [],
  handleToggleSubTask,
}) => {
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

  const percentSubTask = calculateRemainingPercent(
    formatDate(createdAt),
    formatDate(dueDate)
  );

  const progressColor = getColorByPercent(percentSubTask);

  return (
    <tr className="subtask_row">
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
      <td>
        <div className="feature">
          <FaComment size={14} />
        </div>
      </td>
    </tr>
  );
};

export default Subtask;
