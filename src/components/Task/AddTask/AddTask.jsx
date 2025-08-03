import React, { useState } from "react";
import "./AddTask.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import assignUser from "../../../assets/task/assign-user.png";
import iconPriority from "../../../assets/task/icon-priority.png";
import iconSubTask from "../../../assets/task/icon-subtask.png";
import trackTime from "../../../assets/task/icon-track-time.png";
import { useAuth } from "../../../context/AuthProvider";
import taskService from "../../../service/TaskService";
import { toast } from "react-toastify";
import axios from "axios";
import decodeToken from "../../../service/DecodeJwt";

const AddTask = (props) => {
  const { user } = useAuth();
  const userData = decodeToken(user?.token);
  const notify = () => toast.success("Add task is successfully");
  const { addTask } = taskService();
  const visibleMembers = props.members.slice(0, 3);
  const extraCount = props.members.length - visibleMembers.length;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [taskData, setTaskData] = useState({
    taskId: "",
    taskTitle: "",
    taskDescription: "",
    groupId: props.group || "",
    documentId: "",
    taskPoint: 5,
    taskDueDate: "",
    priority: "",
    statusTaskId: props.status.statusTaskId,
    assignTo: [],
    parentTaskId: "",
  });
  const [colorPriority, setColorPriority] = useState([
    { id: 1, color: "#FF6B6B", content: "HIGH", borderColor: "#DC2626" },
    { id: 2, color: "#FFD60A", content: "MEDIUM", borderColor: "#D97706" },
    { id: 3, color: "#22C55E", content: "LOW", borderColor: "#15803D" },
  ]);
  const [selectedPriority, setSelectedPriority] = useState("HIGH");
  const selectedColor = colorPriority.find((item) => item.content === selectedPriority)?.color || "#FFFFFF";
  const selectedBorderColor = colorPriority.find((item) => item.content === selectedPriority)?.borderColor || "#000000";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.taskTitle.trim()) {
      alert("Task title is required!");
      return;
    }
    setIsSubmitting(true);
    try {
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0];
      let formattedDueDate = taskData.taskDueDate
        ? `${taskData.taskDueDate}T${currentTime}`
        : now.toISOString().split(".")[0];
      const payload = {
        taskId: "",
        groupId: props.group || "",
        taskTitle: taskData.taskTitle,
        taskDescription: taskData.taskDescription,
        statusTaskId: taskData.statusTaskId,
        documentId: "",
        taskPoint: 0,
        taskParentId: 0,
        taskDueDate: formattedDueDate,
        createdBy: user?.userName || userData?.username || "Unknown",
        updatedBy: "",
        priority: taskData.priority || "HIGH",
        listUserAssign: taskData.assignTo,
      };
      console.log("Payload sent to server:", payload);
      const response = await addTask(payload, user.token);
      if (response.data) {
        console.log("Response from server:", response.data);
        notify();
        await axios.post("http://localhost:3000/notifications", {
          id: Math.random().toString(16).slice(2, 6),
          title: `Thông báo môn ${taskData.taskTitle}`,
          author: {
            _id: Math.random(),
            name: user.username || userData?.username || "Unknown",
            avatar:
              user.avatar ||
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
          },
          createdAt: new Date().toISOString().split("T")[0],
          isRead: false,
          _id: Math.random(),
        });
      }
      props.onCancel();
    } catch (e) {
      console.error(
        "Failed to add task:",
        e.response ? e.response.data : e.message,
        e.response ? e.response.status : ""
      );
      alert(
        `Failed to add task: ${
          e.response?.data?.message || e.message || "Unknown error"
        }`
      );
      props.onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task">
      <form className="add-task-container" onSubmit={handleSubmit}>
        <div className="wrapper-title">
          <h2 className="text-heading">Title</h2>
          <i className="fa-solid fa-xmark" onClick={props.onCancel}></i>
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
        <div className="wrapper-subtask">
          <div className="wrapper-subtask-heading">
            <img src={iconSubTask} alt="..." />
            <h2>Subtask</h2>
          </div>
          <div className="wrapper-input">
            <i className="fa-solid fa-plus"></i>
            <input type="text" placeholder="Create Subtask" />
          </div>
        </div>
        <div className="wrapper-assign-user">
          <div className="wrapper-assign-user-heading">
            <img src={assignUser} alt="..." />
            <h2>Assign</h2>
          </div>
          <div className="assigned-users-list">
            {taskData.assignTo.map((userId) => {
              const member = props.members.find((m) => m._id === userId);
              return member ? (
                <div key={userId} className="assigned-user-card">
                  <div className="user-info">
                    <div className="avatar-container">
                      <img
                        src={member.avatar}
                        alt={`${member.name || member.userName}'s Avatar`}
                        className="user-avatar"
                        onError={(e) =>
                          (e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                        }
                      />
                      <div className="check-icon">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    </div>
                    <span className="user-name">
                      {member.name || member.userName}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="remove-user-btn"
                    onClick={() => handleRemoveAssign(userId)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ) : null;
            })}
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
                {props.members.map((member) => (
                  <label key={member._id} className="member-option">
                    <input
                      type="checkbox"
                      value={member._id}
                      checked={taskData.assignTo.includes(member._id)}
                      onChange={handleAssignChange}
                    />
                    <div className="member-info">
                      <img
                        src={
                          member.avatar ||
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                        }
                        alt={member.name || member.userName}
                        className="member-avatar"
                        onError={(e) =>
                          (e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                        }
                      />
                      <span className="member-name">
                        {member.name || member.userName}
                      </span>
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
              style={{ backgroundColor: selectedColor, borderColor: selectedBorderColor }}
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <span className="priority-dot" style={{ backgroundColor: selectedBorderColor }}></span>
              <span>{selectedPriority}</span>
              <i className={`fa-solid ${showPriorityDropdown ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
            </button>
            {showPriorityDropdown && (
              <div className="priority-dropdown">
                {colorPriority.map((item) => (
                  <div
                    key={item.id}
                    className={`priority-option ${selectedPriority === item.content ? "selected" : ""}`}
                    onClick={() => handlePrioritySelect(item.content)}
                  >
                    <span className="priority-dot" style={{ backgroundColor: item.borderColor }}></span>
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
              <input type="date" className="date-input" />
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
        <div className="wrapper-track-time">
          <div className="wrapper-track-time-heading">
            <img src={trackTime || "/placeholder.svg"} alt="...icon" />
            <h2>Track time</h2>
          </div>
          <div className="wrapper-track-time-input">
            <input type="text" placeholder="Enter your date" />
            <input type="text" placeholder="Enter your time" />
            <input type="text" placeholder="Enter your time" />
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