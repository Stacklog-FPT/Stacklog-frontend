import React, { useState } from "react";
import axios from "axios";
import "./FormAddStudent.scss";

const FormAddStudent = ({ subjectList, selectedSubject, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.get("http://localhost:3000/classes");
    const currentClass = res.data[0];

    const updatedSubjects = currentClass.subjects.map((subject) => {
      if (subject.name === selectedSubject) {
        const newId = Math.max(...subject.members.map((m) => m.id), 0) + 1;
        const newMember = { id: newId, ...form };
        return { ...subject, members: [...subject.members, newMember] };
      }
      return subject;
    });

    const updatedClass = { ...currentClass, subjects: updatedSubjects };

    await axios.put(
      `http://localhost:3000/classes/${currentClass.id}`,
      updatedClass
    );

    alert("Thêm học viên thành công!");
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <div className="form__add_student__container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Tên học viên"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email học viên"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="avatar"
              placeholder="Link avatar (tuỳ chọn)"
              onChange={handleChange}
            />
            <button type="submit">Thêm học viên</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormAddStudent;
