import React, { useState, useEffect } from "react";
import "./AddScheduleForm.scss";
import { FaPlus, FaTrash } from "react-icons/fa";
import GroupService from "../../../service/GroupService";
import { useAuth } from "../../../context/AuthProvider";
import ScheduleService from "../../../service/ScheduleService";
const AddScheduleForms = ({ onClose }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const { addCreateSlot } = ScheduleService();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [scheduleData, setScheduleData] = useState({
    slotTitle: "",
    slotDescription: "",
    slotStarTime: "",
    groupId: "",
    userIdAssigns: [],
  });

  const { getGroupByClass } = GroupService();

  const handleGetGroups = async () => {
    try {
      const response = await getGroupByClass(user.token);
      if (response) {
        setGroups(response.data);
      }
    } catch (e) {
      console.error("Lỗi khi lấy nhóm:", e.message);
    }
  };

  useEffect(() => {
    handleGetGroups();
  }, []);

  const handleSelectGroup = (e) => {
    const groupId = e.target.value;
    const group = groups.find((g) => g.groupsId === groupId);
    setSelectedGroup(group);
  };

  const handleRemoveSelectedGroup = () => {
    setSelectedGroup(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroup || !date || !time) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const fullDateTime = new Date(`${date}T${time}:00`).toISOString();

    const payload = {
      ...scheduleData,
      slotStarTime: fullDateTime,
      groupId: selectedGroup.groupsId,
      userIdAssigns: selectedGroup.groupStudents.map((s) => s.userId),
    };

    try {
      const res = await addCreateSlot(user.token, payload);
      if (res.status === 201 || res.status === 200) {
        alert("Tạo lịch thành công!");
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi tạo lịch:", err.message);
      alert("Tạo lịch thất bại!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <form className="add-schedule-form" onSubmit={handleSubmit}>
          <h3>Add new slot</h3>

          {/* Group Selection */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={selectedGroup?.groupsId || ""}
              onChange={handleSelectGroup}
              required
            >
              <option value="">-- Choose Group --</option>
              {groups.map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
            {selectedGroup && (
              <button
                type="button"
                onClick={handleRemoveSelectedGroup}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "red",
                }}
              >
                <FaTrash />
              </button>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="slotTitle">📌 Title:</label>
            <input
              type="text"
              id="slotTitle"
              name="slotTitle"
              value={scheduleData.slotTitle}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="slotDescription">📝 Description:</label>
            <textarea
              id="slotDescription"
              name="slotDescription"
              rows="2"
              value={scheduleData.slotDescription}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">📅 Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time */}
          <div className="form-group">
            <label htmlFor="time">🕒 Start Time:</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit">
            <FaPlus />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleForms;
