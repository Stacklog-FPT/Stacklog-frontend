import React, { useState, useEffect } from "react";
import "./Task.scss";
import adjustIcon from "../../../../../assets/icon/checkTaskByList/adjust.png";
import { useSortable } from "@dnd-kit/sortable";
import Skeleton from "react-loading-skeleton";
import { CSS } from "@dnd-kit/utilities";
import { TbSubtask } from "react-icons/tb";
import { FaComment } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import Subtask from "./Subtask/Subtask";
import ReviewService from "../../../../../service/ReviewService";
import { useAuth } from "../../../../../context/AuthProvider";

const Task = ({ ...props }) => {
  console.log(props.task);
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
  const { user } = useAuth();
  const [showSubTask, setShowSubTask] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const { getAllReview } = ReviewService();
  const handleToggleSubTask = () => {
    setShowSubTask(!showSubTask);
  };

  const fetchCommentLength = async (taskId) => {
    try {
      const response = await getAllReview(user.token, taskId);
      if (response) {
        setCommentLength(response.data.length);
      }
    } catch (e) {
      console.error("Error fetching comment length:", e.message);
      setCommentLength(0);
    }
  };
  useEffect(() => {
    if (props.task?.taskId) {
      fetchCommentLength(props.task.taskId);
    }
  }, [props.task?.taskId]);

  const handleFormatDate = (date) => {
    if (!date) return "No due date";

    const dateObj = new Date(date);
    if (isNaN(dateObj)) {
      console.error(`Invalid date format for ${date}`);
      return "Invalid date";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const visibleMembers = props.members?.slice(0, 3) || [];
  const extraCount = props.members?.length - visibleMembers.length;

  const getColorByPercent = (percent) => {
    if (percent >= 70) return "#4caf50";
    if (percent >= 40) return "#ff9800";
    return "#f44336";
  };

  const calculateRemainingPercent = (createdAt, dueDate) => {
    if (!createdAt || !dueDate) {
      console.warn("Missing createdAt or dueDate");
      return 0;
    }

    const start = new Date(createdAt);
    const end = new Date(dueDate);
    const now = new Date();

    if (isNaN(start) || isNaN(end)) {
      console.error("Invalid date format:", { createdAt, dueDate });
      return 0;
    }

    if (start == null || end == null) {
      console.error("Invalid date format is null:", { createdAt, dueDate });
      return 0;
    }

    if (start == undefined || end == undefined) {
      console.error("Invalid date format is undefined:", {
        createdAt,
        dueDate,
      });
      return 0;
    }

    if (end <= start) {
      console.warn("dueDate is earlier than createdAt");
      return 0;
    }

    if (now > end) {
      console.warn("dueDate has passed");
      return 0;
    }

    const totalDuration = end - start;
    const remainingDuration = end - now;

    const percent = (remainingDuration / totalDuration) * 100;

    const finalPercent = Math.max(0, Math.min(100, Math.round(percent)));
    return finalPercent;
  };

  const percent = calculateRemainingPercent(props.createdAt, props.dueDate);
  const progressColor = getColorByPercent(percent);

  return (
    <>
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
              <h2>{props.title || <Skeleton />}</h2>
            </div>
          </div>
        </td>
        <td>
          <div className="task_list_member">
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
                    alt={`${item.name || item.userName || "Student"} Avatar`}
                    onError={(e) =>
                      (e.target.src =
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                    }
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
            <h2>{props.priority || "No priority"}</h2>
          </div>
        </td>
        <td>
          <div className="feature">
            <FaPlusCircle
              size={14}
              onClick={() => props.onShowAddSubTask(props.task)}
            />
            <div className="comment__lenght">
              <FaComment
                size={14}
                onClick={() => props.onShowComment(props.task?.taskId)}
              />
              <span>{commentLength}</span>
            </div>

            <div className="subtask_length">
              <TbSubtask size={14} onClick={handleToggleSubTask} />
              <span>{props.task.subtasks.length}</span>
            </div>
          </div>
        </td>
      </tr>
      {showSubTask &&
        props.task?.subtasks?.map((sub) => (
          <Subtask
            key={sub.taskId}
            title={sub.taskTitle}
            priority={sub.priority}
            percent={sub.percentProgress}
            createdAt={sub.createdAt}
            dueDate={sub.taskDueDate}
            members={sub.assigns}
            handleToggleSubTask={handleToggleSubTask}
          />
        ))}
    </>
  );
};

export default Task;
