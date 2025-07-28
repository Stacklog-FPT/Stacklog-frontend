// src/components/AddScheduleForm/AddScheduleForm.jsx

import React, { useState } from "react";
import axios from "axios";
import "./AddScheduleForm.scss";

const AddScheduleForms = ({ slot, onClose, onAdded }) => {
  if (!slot) return null;

  const { date, hour } = slot;
  const [startHour, setStartHour] = useState(hour || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !startHour) return alert("Vui lòng điền đầy đủ thông tin!");

    try {
      const formattedHour = startHour.padStart(2, "0");

      const res = await axios.get("http://localhost:3000/schedules");
      const schedules = res.data;

      const found = schedules.find((item) => item[date]);

      if (found) {
        const updatedHours = found[date] || [];
        if (!updatedHours.includes(formattedHour)) {
          updatedHours.push(formattedHour);
        }

        await axios.patch(`http://localhost:3000/schedules/${found.id}`, {
          [date]: updatedHours,
        });
      } else {
        await axios.post("http://localhost:3000/schedules", {
          [date]: [formattedHour],
        });
      }

      alert("Thêm lịch thành công!");
      setStartHour("");
      if (onAdded) onAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Thêm lịch thất bại!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <form className="add-schedule-form" onSubmit={handleSubmit}>
          <h3>Thêm Lịch Mới</h3>
          <p>
            <strong>Ngày:</strong> {date}
          </p>
          <p>
            <strong>Giờ bắt đầu:</strong> {hour}:00
          </p>

          <input type="hidden" value={date} readOnly />

          <input type="hidden" value={startHour} readOnly />

          <button type="submit">Thêm Lịch</button>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleForms;
