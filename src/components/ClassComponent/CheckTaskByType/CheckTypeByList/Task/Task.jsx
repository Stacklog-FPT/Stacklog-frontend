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
import TaskDetails from "../../../../Modal/TaskDetail/TaskDetails";
import { formatDateUI } from "../../../../../helper/formatDate";
import { fetchUserById } from "../../../../../service/UserService";

const Task = ({ ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
  });

  console.log(props);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const { user } = useAuth();
  const [showSubTask, setShowSubTask] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const { getAllReview } = ReviewService();
  const [isDetail, setIsDetail] = useState(false);
  const [memberDetails, setMemberDetails] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch member details for avatars
  useEffect(() => {
    const fetchMembers = async () => {
      if (!props.task?.assignTo || props.task.assignTo.length === 0) {
        setMemberDetails([]);
        return;
      }

      const memberIds = props.task.assignTo
        .map((item) =>
          typeof item === "string" ? item : item._id || item.userId
        )
        .filter(Boolean);

      const members = await Promise.all(
        memberIds.map(async (id) => {
          try {
            const userData = await fetchUserById(user.token, id);
            return {
              _id: userData._id,
              name: userData.full_name || userData.username || "Unknown",
              avatar: userData.avatar_link,
            };
          } catch (err) {
            console.warn("User not found:", id);
            return null;
          }
        })
      );

      setMemberDetails(members.filter(Boolean));
    };

    fetchMembers();
  }, [props.task?.assignTo, user.token]);

  const handleSubtaskDragEnd = () => {
    // const { active, over } = event;
    // if (!over || active.id === over.id) return;
    // const oldIndex = subtasks.findIndex(
    //   (item) => `${props.task.taskId}-subtask-${item.taskId}` === active.id,
    // );
    // const newIndex = subtasks.findIndex(
    //   (item) => `${props.task.taskId}-subtask-${item.taskId}` === over.id,
    // );
    // if (oldIndex !== -1 && newIndex !== -1) {
    //   const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
    //   setSubtasks(newSubtasks);
    // }
  };

  const handleToggleSubTask = () => {
    setShowSubTask(!showSubTask);
  };

  const visibleMembers = memberDetails?.slice(0, 3) || [];
  const extraCount = memberDetails?.length - visibleMembers?.length;

  const parseDDMMYYYY = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return null;

    return new Date(year, month - 1, day);
  };

  const calculateRemainingPercent = (due) => {
    const now = new Date();

    const dueDate = parseDDMMYYYY(due);

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
    if (percent >= 70) return "#4caf50";
    if (percent >= 40) return "#ff9800";
    return "#f44336";
  };

  const percent = calculateRemainingPercent(
    formatDateUI(props.createdAt),
    formatDateUI(props.dueDate)
  );
  const progressColor = getColorByPercent(percent);

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="task_list_container"
        onClick={() => setIsDetail(true)}
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
                    alt={`${item.name || "Student"} Avatar`}
                    title={item.name}
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
          <div className="feature d-flex align-items-start justify-content-start gap-3 w-100">
            <FaPlusCircle
              size={14}
              onClick={() => {
                e.stopPropagation();
                props.onShowAddSubTask(props.task);
              }}
              style={{ marginTop: "5px" }}
            />
            <div className="comment__lenght">
              <FaComment
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onShowComment(props.task); // Change before mock up with BE
                }}
              />
              <span>{props.task?.reviews?.length || 0}</span>
            </div>
            <div className="subtask_length">
              <TbSubtask
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSubTask();
                }}
              />
              <span>{props.task?.subtasks?.length || 0}</span>
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
              props.task?.subtasks?.map(
                (subtask) => `${props.task.taskId}-subtask-${subtask.taskId}`
              ) || []
            }
            strategy={verticalListSortingStrategy}
          >
            {props.task?.subtasks?.length > 0 ? (
              props.task?.subtasks?.map((sub) => (
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
                  <h2
                    style={{
                      fontSize: "15px",
                      color: "#c8cad4",
                      paddingLeft: "25px",
                    }}
                  >
                    No available subtasks
                  </h2>
                </td>
              </tr>
            )}
          </SortableContext>
        </DndContext>
      )}
      {isDetail && (
        <TaskDetails task={props.task} onClose={() => setIsDetail(false)} />
      )}
    </>
  );
};

export default React.memo(Task);
