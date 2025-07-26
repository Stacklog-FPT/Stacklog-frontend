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

const AddTask = (props) => {
  const visibleMembers = props.members.slice(0, 3);
  const extraCount = props.members.length - visibleMembers.length;
  const { user } = useAuth();
  const notify = () => toast.success("Add task is successfully");
  const { addTask } = taskService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    taskId: "",
    groupId: "",
    taskTitle: "",
    taskDescription: "",
    statusTask: props.status,
    documentId: "",
    taskPoint: 5,
    taskParentId: 0,
    dueDate: "",
    createdBy: "",
    updatedBy: "",
    priority: "",
    assigns: "" || [],
  });
  const [colorPriority, setColorPriority] = useState([
    { id: 1, color: "#FFFAEB", content: "HIGH" },
    { id: 2, color: "#3a9e3e", content: "MEDIUM" },
    { id: 3, color: "#6d706e", content: "LOW" },
  ]);
  const [selectedPriority, setSelectedPriority] = useState("HIGH");

  const selectedColor =
    colorPriority.find((item) => item.content === selectedPriority)?.color ||
    "#FFFFFF";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.taskTitle.trim()) {
      alert("Task title is required!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        taskId: "",
        groupId: "group_1",
        taskTitle: taskData.taskTitle,
        taskDescription: taskData.taskDescription,
        statusTask: props.status,
        documentId: "",
        taskPoint: 0,
        taskParentId: 0,
        dueDate: taskData.dueDate,
        createdBy: user.userName,
        updatedBy: "",
        priority: taskData.priority || "HIGH",
        assigns: "" || [],
      };

      console.log(payload);

      const response = await addTask(payload, user.token);
      if (response.data) {
        notify();
      }
      props.onCancel();
    } catch (e) {
      console.error(
        "Failed to add task:",
        e.response ? e.response.data : e.message
      );
      props.onCancel();
      alert("Failed to add task. Please try again.");
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
          <div className="assign-checkbox-list">
            {props.members.map((member) => (
              <label key={member._id}>
                <input
                  type="checkbox"
                  value={member._id}
                  checked={taskData.assigns.includes(member._id)}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setTaskData((prev) => {
                      const newAssigns = checked
                        ? [...prev.assigns, value]
                        : prev.assigns.filter((id) => id !== value);
                      return { ...prev, assigns: newAssigns };
                    });
                  }}
                />
                {member.full_name || member.userName}
              </label>
            ))}
          </div>
        </div>
        <div className="wrapper-priority">
          <div className="wrapper-priority-heading">
            <img src={iconPriority} alt="..." />
            <h2>Priority</h2>
          </div>
          <select
            name="priority"
            className="priority_status"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setTaskData((prev) => ({ ...prev, priority: e.target.value }));
            }}
            style={{ backgroundColor: selectedColor }}
          >
            {colorPriority.map((item) => (
              <option key={item.id} value={item.content}>
                <p>{String(item.content)}</p>
              </option>
            ))}
          </select>
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
                name="dueDate"
                className="date-input"
                value={taskData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="wrapper-track-time">
          <div className="wrapper-track-time-heading">
            <img src={trackTime} alt="...icon" />
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
