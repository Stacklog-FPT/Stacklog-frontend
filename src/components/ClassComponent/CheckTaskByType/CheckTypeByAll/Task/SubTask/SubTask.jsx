import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import Skeleton from "react-loading-skeleton";
import Swal from "sweetalert2";
import iconDeadLine from "../../../../../../assets/icon/task/iconDeadLine.png";
import addButton from "../../../../../../assets/icon/avatar_add_button.png";
import "./SubTask.scss";
import { useAuth } from "../../../../../../context/AuthProvider";
import { deleteTaskApi } from "../../../../../../service/TaskService";
import { useDispatch } from "react-redux";
import { formatDateUI } from "../../../../../../helper/formatDate";

const SubTask = ({
  id,
  title,
  priority,
  dueDate,
  createAt,
  startTime,
  members,
  subTaskId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  console.log("DueDate props: ", dueDate);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 0.2s ease, opacity 0.2s ease",
    opacity: isDragging ? 0.6 : 1,
  };
  console.log("Subtask call: ", {
    id,
    title,
    priority,
    dueDate,
    createAt,
    startTime,
    members,
    subTaskId,
  });
  const { user } = useAuth();
  const dispatch = useDispatch();
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

  const parseDDMMYYYY = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return null;

    return new Date(year, month - 1, day);
  };

  const calculateRemainingPercent = (due) => {
    const now = new Date();

    const dueDate = parseDDMMYYYY(due);

    console.log("DueDate:", dueDate);

    // Kiểm tra hợp lệ
    if (!dueDate || isNaN(dueDate)) {
      return 0;
    }

    // Nếu đã quá hạn hoặc đúng ngày due → 0%
    if (now >= dueDate) {
      return 0;
    }

    // Giả định task bắt đầu 30 ngày trước dueDate
    const assumedStartDate = new Date(dueDate);
    assumedStartDate.setDate(dueDate.getDate() - 30);

    // Nếu hiện tại chưa đến ngày bắt đầu (hiếm xảy ra) → 100%
    if (now <= assumedStartDate) {
      return 100;
    }

    const totalTime = dueDate - assumedStartDate; // milliseconds
    const remainingTime = dueDate - now;

    const percent = Math.round((remainingTime / totalTime) * 100);

    return Math.max(percent, 0); // đảm bảo không âm
  };

  const getColorByPercent = (percent) => {
    if (percent >= 70) return "#4caf50"; // còn nhiều thời gian → xanh
    if (percent >= 30) return "#ff9800"; // sắp hết → cam
    return "#f44336"; // rất gấp → đỏ
  };

  const percentSubTask = calculateRemainingPercent(formatDateUI(dueDate));
  const progressColor = getColorByPercent(percentSubTask);

  const handleDeleteTask = async (taskId) => {
    if (!user?.token) {
      Swal.fire("Error!", "User not authenticated.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure to delete this task?",
      text: "This action can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const response = await deleteTaskApi(user.token, taskId, dispatch);
      if (response.data === "Delete success") {
        Swal.fire("Deleted!", "Task was removed successfully.", "success");
      } else {
        throw new Error("Unexpected response from server");
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`subtask-container ${isDragging ? "dragging" : ""}`}
      data-priority={priority}
    >
      <div className="subtask-content">
        <div className="subtask-content-head">
          <div className="drag-handle" {...attributes} {...listeners}>
            <span title={title}>
              {title?.length > 5
                ? `${title.slice(0, 5)}...`
                : title || <Skeleton />}
            </span>
          </div>
          <div className="subtask-content-head-icon">
            {/* <FaPen className="icon" size={12} />
            <i
              className="fa-solid fa-bookmark"
              style={{
                color: priority === "HIGH" ? "#045745" : "inherit",
                cursor: "pointer",
              }}
            /> */}
            {/* <CiCirclePlus className="icon" size={14} /> */}
            <FaTrashAlt
              className="icon trash-icon"
              size={12}
              onClick={() => handleDeleteTask(subTaskId)}
            />
          </div>
        </div>
        <div className="task-content-percent">
          <div className="task-content-percent-container">
            <div
              className="task-content-percent-line"
              style={{
                width: `${percentSubTask}%`,
                backgroundColor: progressColor,
              }}
            ></div>
          </div>
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
        {/* <div className="subtask-content-members">
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
        </div> */}
      </div>
    </div>
  );
};

export default React.memo(SubTask);
