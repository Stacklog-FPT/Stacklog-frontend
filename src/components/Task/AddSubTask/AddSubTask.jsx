import React, { useState } from "react";
import "./AddSubTask.scss";
import assignUser from "../../../assets/task/assign-user.png";
import iconSubTask from "../../../assets/task/icon-subtask.png";
import iconPriority from "../../../assets/task/icon-priority.png";
import trackTime from "../../../assets/task/icon-track-time.png";
import taskService from "../../../service/TaskService";
import { useAuth } from "../../../context/AuthProvider";
const AddSubTask = ({ isClose, task }) => {
  const [subTaskData, setSubTaskData] = useState({
    taskId: "",
    groupId: "",
    taskTitle: "",
    taskDescription: "",
    documentId: "",
    taskPoint: 0,
    taskParentId: 0,
    dueDate: "",
    createdBy: "",
    updatedBy: "",
    priority: "",
    statusTask: {
      createdBy: "",
      createdAt: "",
      updateBy: "",
      updateAt: "",
      statusTaskId: "",
      statusTaskName: "",
      statusTaskColor: "",
      groupId: "",
    },
    listUserAssign: [],
  });
  const { user } = useAuth();
  const { addTask } = taskService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubTaskData((prev) => ({ ...prev, [name]: value }));
  };
  const [colorPriority, setColorPriority] = useState([
    { id: 1, color: "#FFFAEB", content: "HIGH" },
    { id: 2, color: "#3a9e3e", content: "MEDIUM" },
    { id: 3, color: "#6d706e", content: "LOW" },
  ]);
  const [selectedPriority, setSelectedPriority] = useState("HIGH");
  const selectedColor =
    colorPriority.find((item) => item.content === selectedPriority)?.color ||
    "#FFFFFF";

  const handleSubmitSubTask = async () => {
    try {
      const payload = {
        taskId: subTaskData.taskId,
        groupId: "group_1",
        taskTitle: subTaskData.taskTitle,
        taskDescription: subTaskData.taskDescription,
        documentId: "",
        taskPoint: 0,
        taskParentId: 0,
        dueDate: "",
        createdBy: "",
        updatedBy: "",
        priority: subTaskData.priority,
        statusTask: {
          createdBy: task.statusTask.createdBy,
          createdAt: task.statusTask.createdAt,
          updateBy: task.statusTask.updateBy,
          updateAt: task.statusTask.updateAt,
          statusTaskId: task.statusTask.statusTaskId,
          statusTaskName: task.statusTask.statusTaskName,
          statusTaskColor: task.statusTask.statusTaskColor,
          groupId: task.statusTask.groupId,
        },
        listUserAssign: [
          "6801ccf3b8b39cd0e4d38877",
          "68768017c89a12a7e51ddebd",
        ],
      };
      const response = await addTask(payload, user?.token);
      if (response) {
        console.log(response);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };
  return (
    <div className="add__subtask">
      <form className="add__subtask__container" onSubmit={handleSubmitSubTask}>
        <div className="wrapper-title">
          <h2 className="text-heading">Title</h2>
          <i className="fa-solid fa-xmark" onClick={isClose}></i>
        </div>
        <div className="wrapper-title-input">
          <input
            type="text"
            name="taskTitle"
            placeholder="Enter task title..."
            value={subTaskData.setSubTaskData}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="wrapper-description">
          <h2>Description</h2>
          <textarea
            placeholder="Enter a description..."
            name="taskDescription"
            value={subTaskData.setSubTaskData}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="wrapper-assign-user">
          <div className="wrapper-assign-user-heading">
            <img src={assignUser} alt="..." />
            <h2>Assign</h2>
          </div>
          <div className="assign-checkbox-list">
            {task.assigns.map((member) => (
              <label key={member._id}>
                <input
                  type="checkbox"
                  value={member._id}
                  checked={subTaskData.listUserAssign.includes(member._id)}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setSubTaskData((prev) => {
                      const newAssigns = checked
                        ? [...prev.listUserAssign, value]
                        : prev.listUserAssign.filter((id) => id !== value);
                      return { ...prev, listUserAssign: newAssigns };
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
              setSubTaskData((prev) => ({ ...prev, priority: e.target.value }));
            }}
            style={{ backgroundColor: selectedColor }}
          >
            {colorPriority.map((item) => (
              <option key={item.id} value={item.content}>
                {item.content}
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
                value={subTaskData.setSubTaskData}
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

export default AddSubTask;
