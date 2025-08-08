import React, { useState, useEffect } from "react";
import "./Task.scss";
import Skeleton from "react-loading-skeleton";
import iconDeadLine from "../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../assets/icon/avatar_add_button.png";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
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
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import taskService from "../../../../../service/TaskService";
import { useAuth } from "../../../../../context/AuthProvider";
import SubTask from "./SubTask/SubTask";
import ReviewService from "../../../../../service/ReviewService";

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
  } = useSortable({ id: props.id, disabled: isDraggingOverlay });
  const { user } = useAuth();
  const [showSubTask, setShowSubTask] = useState(false);
  const { deleteTask, addTask } = taskService();
  const { getAllReview } = ReviewService();
  const [commentLength, setCommentLength] = useState(0);
  const [subtasks, setSubtasks] = useState(props.task?.subtasks || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(props.task?.taskTitle || "");
  const [editedStartTime, setEditedStartTime] = useState(
    props.task?.taskStartTime || ""
  );
  const [editedDueDate, setEditedDueDate] = useState(
    props.task?.taskDueDate || ""
  );
  const sensors = useSensors(useSensor(PointerSensor));

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
      const payload = {
        taskId: task.taskId,
        taskTitle: task.taskTitle,
        taskDescription: task.taskDescription,
        groupId: task.groupId,
        documentId: task.documentId,
        taskPoint: 5,
        taskStartTime: task.taskStartTime,
        taskDueDate: task.taskDueDate,
        priority: "HIGH",
        statusTaskId: task.statusTask.statusTaskId,
        listUserAssign: task.assigns.assignTo,
        parentTaskId: "",
      };

      console.log(payload);
      const response = await addTask(payload, user?.token);
      if (response.status === 500) {
      }
      // toast.success("Priority is update!");
    } catch (e) {
      handleDeleteReRender(true);
      // toast.error("Something is wrong!");
      console.error("Error updating priority:", e.message);
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

  const handleUpdateTask = async (task) => {
    let flag = true;
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
        taskId: task.taskId,
        taskTitle: editedTitle,
        taskDescription: task.taskDescription,
        groupId: task.groupId,
        documentId: task.documentId,
        taskPoint: 5,
        taskStartTime: formattedStartTime,
        taskDueDate: formattedDueDate,
        priority: task.priority,
        statusTaskId: task.statusTask.statusTaskId,
        listUserAssign: task.assigns.assignTo,
        parentTaskId: "",
      };

      setIsEditing(false);
      const response = await addTask(payload, user.token);
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const handleDeleteTask = async (taskId, task) => {
    let flag = false;

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
        const response = await deleteTask(user.token, taskId);
        if (response.data === "Delete success") {
          flag = true;
          setShowSubTask(false);
          handleDeleteReRender(flag);

          await axios.post("http://localhost:3000/notifications", {
            id: Math.random().toString(16).slice(2, 6),
            title: `Delete task ${task.taskTitle} by ${user.username}`,
            author: {
              _id: Math.random(),
              name: user.username || "Unknown",
              avatar:
                user.avatar ||
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            },
            createdAt: new Date().toISOString().split("T")[0],
            isRead: false,
            _id: Math.random(),
          });
        }

        Swal.fire("Deleted!", "Task was removed successfully.", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  const percent = calculateRemainingPercent(
    props?.task?.taskStartTime,
    props.dueDate
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
                  onClick={() => handleUpdateTask(props.task)}
                />
              ) : (
                <FaPen
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
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
                onClick={() => handleEditPriority(props.task)}
              />
              <FaPlus
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => props.onShowAddSubTask(props.task)}
              />
              <FaTrashAlt
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => handleDeleteTask(props.task.taskId, props.task)}
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
                  {formatDate(props?.task?.taskStartTime) || <Skeleton />}
                </span>
                <img src={iconDeadLine} alt="icon" />
                <span>{formatDate(props.dueDate) || <Skeleton />}</span>
              </>
            )}
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
                <span>{commentLength}</span>
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
          (subtasks?.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubtaskDragEnd}
            >
              <SortableContext
                items={subtasks?.map(
                  (subtask) => `${props.task.taskId}-subtask-${subtask.taskId}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="subtask-list">
                  {subtasks?.map((item) => (
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
                      subtask={item}
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
    </>
  );
};

export default React.memo(Task);
