import React, { useState, useEffect } from "react";
import "./Task.scss";
import Skeleton from "react-loading-skeleton";
import iconDeadLine from "../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../assets/icon/avatar_add_button.png";
import Swal from "sweetalert2";
import { FaPen } from "react-icons/fa";
import iconDontKnow from "../../../../../assets/icon/task/iconDontKnow.png";
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
import { formatDateUI } from "../../../../../helper/formatDate";
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { useAuth } from "../../../../../context/AuthProvider";
import SubTask from "./SubTask/SubTask";
import { useDispatch } from "react-redux";
import {
  deleteTaskApi,
  updateTaskApi,
} from "../../../../../service/TaskService";
import TaskDetails from "../../../../Modal/TaskDetail/TaskDetails";

const Task = ({
  isDraggingOverlay,
  onTaskAdded,
  handleDeleteReRender,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    disabled: isDraggingOverlay,
  });
  const { user } = useAuth();
  const [showSubTask, setShowSubTask] = useState(false);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(props.task?.taskTitle || "");
  const [editedStartTime, setEditedStartTime] = useState(
    props.task?.taskStartTime || ""
  );
  const [editedDueDate, setEditedDueDate] = useState(
    props.task?.taskDueDate || ""
  );
  const [isShowDetail, setIsShowDetail] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleSubtaskDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = props.task?.subtasks.findIndex(
      (item) => `${props.task.taskId}-subtask-${item.taskId}` === active.id
    );
    const newIndex = props.task?.subtasks.findIndex(
      (item) => `${props.task.taskId}-subtask-${item.taskId}` === over.id
    );
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSubtasks = arrayMove(props.task?.subtasks, oldIndex, newIndex);
    }
  };

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

  const visibleMembers = props.task?.assignTo?.slice(0, 3);
  const extraCount = props.task?.assignTo?.length - visibleMembers?.length;

  const handleEditPriority = async (task) => {
    const payload = {
      ...task,
      priority: "HIGH",
    };
    await updateTaskApi(payload, user.token, dispatch);
  };

  const calculateRemainingPercent = (start, due) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(due);
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    const total = e - s;
    const passed = Math.min(Math.max(now - s, 0), total);
    return Math.round((passed / total) * 100);
  };

  const getColorByPercent = (percent) => {
    if (percent >= 70) return "#4caf50";
    if (percent >= 40) return "#ff9800";
    return "#f44336";
  };

  const handleUpdateTask = async (task) => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0];

      if (!editedStartTime || !editedDueDate) {
        toast.error("Start time and due date are required!");
        return;
      }

      const formattedStartTime = `${
        editedStartTime || props.task?.taskStartTime?.slice(0, 10)
      }T${currentTime}`;
      const formattedDueDate = `${
        editedDueDate || props.task?.taskDueDate?.slice(0, 10)
      }T${currentTime}`;

      const startTime = new Date(formattedStartTime);
      const dueDate = new Date(formattedDueDate);

      if (startTime >= dueDate) {
        toast.error("Start time must be earlier than due date!");
        return;
      }

      const payload = {
        ...task,
        taskTitle: editedTitle,
        taskStartTime: formattedStartTime,
        taskDueDate: formattedDueDate,
      };

      await updateTaskApi(payload, user.token, dispatch);
      setIsEditing(false);
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const handleDeleteTask = async (taskId, task) => {
    const result = await Swal.fire({
      title: "Are you sure to delete this task?",
      text: "This action can't completed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteTaskApi(user.token, task.taskId, dispatch);
        console.log(response);
        if (response.data === "Delete success") {
          Swal.fire("Deleted!", "Task was removed successfully.", "success");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  const percent = calculateRemainingPercent(
    formatDateUI(props.createdAt),
    formatDateUI(props.dueDate)
  );
  const progressColor = getColorByPercent(percent);

  return (
    <>
      <div
        ref={isDraggingOverlay ? null : setNodeRef}
        style={style}
        {...(isDraggingOverlay ? {} : attributes)}
        {...(isDraggingOverlay ? {} : listeners)}
        className={`task-container${
          isDraggingOverlay ? " isDraggingOverlay" : ""
        }${isDragging && !isDraggingOverlay ? " dragging" : ""}`}
        onClick={() => setIsShowDetail(!isShowDetail)}
      >
        <div className="task-content">
          <div className="task-content-head">
            <span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="task-input-title"
                />
              ) : props.title?.length > 10 ? (
                `${props.title.slice(0, 10)}...`
              ) : (
                props.title || <Skeleton />
              )}
            </span>

            <div className="task-content-head-icon">
              {isEditing ? (
                <i
                  className="fa-solid fa-check"
                  style={{ cursor: "pointer", color: "#000" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateTask(props.task);
                  }}
                />
              ) : (
                <FaPen
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                />
              )}
              <i
                className="fa-solid fa-bookmark"
                style={{
                  color: props?.task?.priority === "HIGH" ? "red" : "inherit",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPriority(props.task);
                }}
              />
              <FaPlus
                size={12}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onShowAddSubTask(props.task);
                }}
              />
              <FaTrashAlt
                size={12}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(props.task.taskId, props.task);
                }}
              />
            </div>
          </div>
          <div className="task-content-percent">
            <div className="task-content-percent-container">
              <div
                className="task-content-percent-line"
                style={{ width: `${percent}%`, backgroundColor: progressColor }}
              ></div>
            </div>
            <span>{percent}%</span>
          </div>

          <div className="task-content-deadline">
            {isEditing ? (
              <>
                <input
                  type="date"
                  value={editedStartTime?.slice(0, 10)}
                  onChange={(e) => setEditedStartTime(e.target.value)}
                  className="task-input-date"
                />
                <img src={iconDeadLine} alt="icon" />
                <input
                  type="date"
                  value={editedDueDate?.slice(0, 10)}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  className="task-input-date"
                />
              </>
            ) : (
              <>
                <span>
                  {formatDateUI(props?.task?.taskStartTime) || <Skeleton />}
                </span>
                <img src={iconDeadLine} alt="icon" />
                <span>
                  {formatDateUI(props?.task?.taskDueDate) || <Skeleton />}
                </span>
              </>
            )}
          </div>

          <div className="task-content-members">
            <ul
              className="task-content-members-student-list"
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
              <img src={addButton} alt="this is icon" />
            </button>
          </div>
          <div className="task-content-contact">
            <div className="task-content-contact-left">
              <div className="task-content-contact-left-element">
                <i
                  className="fa-solid fa-comment"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onShowComment(props.task);
                  }} // Change taskId when mockup with BE
                ></i>
                <span>{props.task?.reviews?.length || 0}</span>
              </div>
              <div
                className="task-content-contact-left-element"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubTask(!showSubTask);
                }}
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
          (props.task?.subtasks?.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubtaskDragEnd}
            >
              <SortableContext
                items={props.task?.subtasks?.map(
                  (subtask) => `${props.task.taskId}-subtask-${subtask.taskId}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="subtask-list">
                  {props.task?.subtasks?.map((item) => (
                    <SubTask
                      key={`${props.task.taskId}-subtask-${item.taskId}`}
                      id={`${props.task.taskId}-subtask-${item.taskId}`}
                      title={item.taskTitle}
                      subTaskId={item.taskId}
                      priority={item.priority}
                      percent={item.percent}
                      createdAt={item.createdAt}
                      dueDate={item.taskDueDate}
                      startTime={item.taskStartTime}
                      members={item.assigns}
                      taskId={props.task.taskId}
                      reviews={item.reviews}
                      handleDeleteReRender={handleDeleteReRender}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <h2>No available subtasks</h2>
          ))}
      </div>
      {isShowDetail && (
        <TaskDetails
          task={props.task}
          onClose={() => setIsShowDetail(!isShowDetail)}
        />
      )}
    </>
  );
};

export default React.memo(Task);
