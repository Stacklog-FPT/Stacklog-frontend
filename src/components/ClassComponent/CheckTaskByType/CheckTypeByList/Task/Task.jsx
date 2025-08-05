import React, { useState, useEffect } from "react";
import "./Task.scss";
import adjustIcon from "../../../../../assets/icon/checkTaskByList/adjust.png";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Skeleton from "react-loading-skeleton";
import { CSS } from "@dnd-kit/utilities";
import { TbSubtask } from "react-icons/tb";
import { FaComment } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import Subtask from "./Subtask/Subtask";
import ReviewService from "../../../../../service/ReviewService";
import { useAuth } from "../../../../../context/AuthProvider";

const Task = ({ ...props }) => {
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

  // State quản lý thứ tự subtask để kéo thả
  const [subtasks, setSubtasks] = useState(props.task?.subtasks || []);
  useEffect(() => {
    setSubtasks(props.task?.subtasks || []);
  }, [props.task?.subtasks]);

  // Dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // Xử lý kéo thả subtask
  const handleSubtaskDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = subtasks.findIndex(
      (item) => `${props.task.taskId}-subtask-${item.taskId}` === active.id
    );
    const newIndex = subtasks.findIndex(
      (item) => `${props.task.taskId}-subtask-${item.taskId}` === over.id
    );
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
      setSubtasks(newSubtasks);
      // TODO: Gọi API cập nhật thứ tự nếu muốn lưu lên server
    }
  };

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
    if (isNaN(dateObj)) return "Invalid date";
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
    if (!createdAt || !dueDate) return 0;
    const start = new Date(createdAt);
    const end = new Date(dueDate);
    const now = new Date();
    if (isNaN(start) || isNaN(end) || end <= start || now > end) return 0;
    const totalDuration = end - start;
    const remainingDuration = end - now;
    const percent = (remainingDuration / totalDuration) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
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
              <span>{subtasks.length}</span>
            </div>
          </div>
        </td>
      </tr>
      {showSubTask && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSubtaskDragEnd}
        >
          <SortableContext
            items={
              subtasks.map(
                (subtask) => `${props.task.taskId}-subtask-${subtask.taskId}`
              ) || []
            }
            strategy={verticalListSortingStrategy}
          >
            {subtasks.length > 0 ? (
              subtasks.map((sub) => (
                <Subtask
                  key={`${props.task.taskId}-subtask-${sub.taskId}`}
                  id={`${props.task.taskId}-subtask-${sub.taskId}`}
                  title={sub.taskTitle}
                  priority={sub.priority}
                  percent={sub.percentProgress}
                  createdAt={sub.createdAt}
                  dueDate={sub.taskDueDate}
                  members={sub.assigns}
                  handleToggleSubTask={handleToggleSubTask}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <h2>No available subtasks</h2>
                </td>
              </tr>
            )}
          </SortableContext>
        </DndContext>
      )}
    </>
  );
};

export default React.memo(Task);
