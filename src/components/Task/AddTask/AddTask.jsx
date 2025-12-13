import React, { useState, useEffect, useMemo } from "react";
import "./AddTask.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import assignUser from "../../../assets/task/assign-user.png";
import userApi from "../../../service/UserService";
import iconPriority from "../../../assets/task/icon-priority.png";
import { useAuth } from "../../../context/AuthProvider";
import axios from "axios";
import decodeToken from "../../../service/DecodeJwt";
import { addTask } from "../../../service/TaskService";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { fetchUserById } from "../../../service/UserService";

const AddTask = ({ status, onCancel, group }) => {
  const { user } = useAuth();
  const userData = decodeToken(user?.token);
  const groupList = useSelector((state) => state.group.groups);
  const currentGroup = groupList.find((g) => g.groupsId === group);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("LOW");
  const [studentInformation, setStudentInformation] = useState([]);
  const [taskData, setTaskData] = useState({
    taskId: "",
    taskTitle: "",
    taskDescription: "",
    groupId: group,
    documentId: "",
    taskPoint: 0,
    taskDueDate: "",
    taskStartTime: "",
    priority: selectedPriority,
    createdBy: "",
    createdAt: "",
    updateBy: "",
    updateAt: "",
    statusTaskId: status.statusTaskId,
    review: [],
    parentTask: null,
    assignTo: [],
  });

  const selectedMembers = Array.isArray(studentInformation)
    ? studentInformation.filter(
        (m) => m && m._id && taskData.assignTo.includes(m._id)
      )
    : [];

  const [colorPriority, setColorPriority] = useState([
    { id: 1, color: "#FF6B6B", content: "HIGH", borderColor: "#DC2626" },
    { id: 2, color: "#FFD60A", content: "MEDIUM", borderColor: "#D97706" },
    { id: 3, color: "#22C55E", content: "LOW", borderColor: "#15803D" },
  ]);

  const selectedColor =
    colorPriority.find((item) => item.content === selectedPriority)?.color ||
    "#FFFFFF";
  const selectedBorderColor =
    colorPriority.find((item) => item.content === selectedPriority)
      ?.borderColor || "#000000";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e) => {
    const { checked, value } = e.target;
    setTaskData((prev) => {
      const newAssigns = checked
        ? [...prev.assignTo, value]
        : prev.assignTo.filter((id) => id !== value);
      return { ...prev, assignTo: newAssigns };
    });
  };

  const handleRemoveAssign = (userId) => {
    setTaskData((prev) => ({
      ...prev,
      assignTo: prev.assignTo.filter((id) => id !== userId),
    }));
  };

  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
    setTaskData((prev) => ({ ...prev, priority }));
    setShowPriorityDropdown(false);
  };

  const validateForm = () => {
    if (!taskData.taskTitle.trim()) {
      toast.error("Task title is required!");
      return false;
    }

    if (!taskData.taskDescription.trim()) {
      toast.error("Task description is required!");
      return false;
    }

    if (
      !taskData.taskPoint ||
      taskData.taskPoint < 4 ||
      taskData.taskPoint > 10
    ) {
      toast.error("Task point must be between 4 and 10!");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (taskData.taskStartTime) {
      const startDate = new Date(taskData.taskStartTime);
      if (startDate < today) {
        toast.error("Start date must be today or later!");
        return false;
      }
    }

    if (taskData.taskDueDate) {
      const dueDate = new Date(taskData.taskDueDate);
      if (dueDate < today) {
        toast.error("Due date must be today or later!");
        return false;
      }
    }

    if (taskData.taskStartTime && taskData.taskDueDate) {
      const startDate = new Date(taskData.taskStartTime);
      const dueDate = new Date(taskData.taskDueDate);
      if (startDate > dueDate) {
        toast.error("Start date must be before or equal to due date!");
        return false;
      }
    }

    if (taskData.assignTo.length < 1) {
      toast.error("The task must have at least one member!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0];
      let formattedStartTime = taskData.taskStartTime
        ? `${taskData.taskStartTime}T${currentTime}`
        : "";

      let formattedDueDate = taskData.taskDueDate
        ? `${taskData.taskDueDate}T${currentTime}`
        : "";

      const payload = {
        taskId: "",
        groupId: taskData.groupId,
        taskTitle: taskData.taskTitle,
        taskDescription: taskData.taskDescription,
        statusTaskId: taskData.statusTaskId,
        documentId: "",
        taskPoint: taskData.taskPoint,
        taskParentId: "",
        taskStartTime: formattedStartTime,
        taskDueDate: formattedDueDate,
        createdBy: userData?.id || "Unknown",
        updatedBy: "",
        priority: taskData.priority,
        listUserAssign: taskData.assignTo,
        subTasks: [],
        reviews: [],
        checkLists: [],
      };
      console.log(payload);
      const response = await addTask(payload, user.token, dispatch);
      if (response.status === 200) {
        toast.success("Add task success");
      }
      onCancel();
    } catch (e) {
      console.error(
        "Failed to add task:",
        e.response ? e.response.data : e.message,
        e.response ? e.response.status : ""
      );
      toast.error("Add task failure");
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchStudent = async () => {
      if (
        !currentGroup?.groupStudents ||
        currentGroup.groupStudents.length === 0
      ) {
        setStudentInformation([]);
        return;
      }

      const userIds = currentGroup.groupStudents.map((item) => item.userId);

      const studentInfos = await Promise.all(
        userIds.map(async (id) => {
          try {
            const u = await fetchUserById(user.token, id);
            if (!u?._id) return null;
            return {
              _id: u._id,
              name: u.full_name || "Unknown",
              avatar: u.avatar_link,
            };
          } catch (err) {
            console.warn("User not found:", id);
            return null;
          }
        })
      );

      setStudentInformation(studentInfos.filter(Boolean));
    };

    fetchStudent();
  }, [currentGroup, user?.token]);

  return (
    <div className="add-task">
      <form className="add-task-container" onSubmit={handleSubmit}>
        <div className="wrapper-title">
          <h2 className="text-heading">Title</h2>
          <i className="fa-solid fa-xmark" onClick={onCancel}></i>
        </div>
        <div className="wrapper-title-input">
          <input
            type="text"
            name="taskTitle"
            placeholder="Enter task title..."
            value={taskData.taskTitle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="wrapper-description">
          <h2>Description</h2>
          <textarea
            placeholder="Enter a description..."
            name="taskDescription"
            value={taskData.taskDescription}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="wrapper-title">
          <h2 className="text-heading">Task point</h2>
          <i className="fa-solid fa-xmark" onClick={onCancel}></i>
        </div>
        <div className="wrapper-title-input">
          <input
            type="number"
            name="taskPoint"
            placeholder="Enter task point 4 - 15 points..."
            value={taskData.taskPoint}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="wrapper-assign-user">
          <div className="wrapper-assign-user-heading">
            <img src={assignUser} alt="..." />
            <h2>Assign</h2>
          </div>
          <div className="assigned-users-list">
            {selectedMembers.map((member) => (
              <div key={member._id} className="assigned-user-card">
                <div className="user-info">
                  <div className="avatar-container">
                    <img
                      src={
                        member.avatar ||
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                      alt={`${member.name}'s Avatar`}
                      className="user-avatar"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                      }}
                    />
                    <div className="check-icon">
                      <i className="fa-solid fa-check"></i>
                    </div>
                  </div>
                  <span className="user-name">{member.name}</span>
                </div>
                <button
                  type="button"
                  className="remove-user-btn"
                  onClick={() => handleRemoveAssign(member._id)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>
          <div className="add-member-section">
            <button
              type="button"
              className="add-member-btn"
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
            >
              <img
                src={avatar_add_button || "/placeholder.svg"}
                alt="add_button_icon"
              />
              <span>Add Member</span>
            </button>
          </div>
          {showAssignDropdown && (
            <div className="assign-dropdown">
              <div className="assign-checkbox-list">
                {studentInformation
                  .filter((member) => member && member._id)
                  .map((member) => (
                    <label key={member._id} className="member-option">
                      <input
                        type="checkbox"
                        value={member._id}
                        checked={
                          taskData.assignTo?.includes(member._id) || false
                        }
                        onChange={handleAssignChange}
                      />
                      <div className="member-info">
                        <img
                          src={
                            member.avatar ||
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                          }
                          alt={member.name}
                          className="member-avatar"
                          onError={(e) =>
                            (e.target.src =
                              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                          }
                        />
                        <span className="member-name">{member.name}</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="wrapper-priority">
          <div className="wrapper-priority-heading">
            <img src={iconPriority || "/placeholder.svg"} alt="..." />
            <h2>Priority</h2>
          </div>
          <div className="priority-selector">
            <button
              type="button"
              className="priority-toggle"
              style={{
                backgroundColor: selectedColor,
                borderColor: selectedBorderColor,
              }}
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <span
                className="priority-dot"
                style={{ backgroundColor: selectedBorderColor }}
              ></span>
              <span>{selectedPriority}</span>
              <i
                className={`fa-solid ${
                  showPriorityDropdown ? "fa-chevron-up" : "fa-chevron-down"
                }`}
              ></i>
            </button>
            {showPriorityDropdown && (
              <div className="priority-dropdown">
                {colorPriority.map((item) => (
                  <div
                    key={item.id}
                    className={`priority-option ${
                      selectedPriority === item.content ? "selected" : ""
                    }`}
                    onClick={() => handlePrioritySelect(item.content)}
                  >
                    <span
                      className="priority-dot"
                      style={{ backgroundColor: item.borderColor }}
                    ></span>
                    <span>{item.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="wrapper-start-end-time">
          <div className="wrapper_input_time">
            <p>Start</p>
            <div className="date-input-container">
              <input
                type="date"
                name="taskStartTime"
                className="date-input"
                value={taskData.taskStartTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="wrapper_input_time">
            <p>Deadline</p>
            <div className="date-input-container">
              <input
                type="date"
                name="taskDueDate"
                className="date-input"
                value={taskData.taskDueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="wrapper-btn-submit">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
