import React, { useState } from "react";
import "./FormAddLecture.scss";
import LectureService from "../../../service/LectureStudentService";
import { useAuth } from "../../../context/AuthProvider";

const FormAddLecture = ({ onClose }) => {
  const { createUser } = LectureService();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    work_id: "",
    email: "",
    avatar_link: "",
    description: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar_link" && files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        avatar_link: files[0].name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.full_name,
        work_id: formData.work_id,
        email: formData.email,
        avatar_link: formData.avatar_link,
        description: formData.description,
        role: formData.role,
      };
      const response = await createUser(user.token, payload);

      if (response) {
        console.log(response);
        onClose();
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return (
    <div className="add-user-overlay">
      <div className="add-user-popup">
        <h2>Add User</h2>
        <form onSubmit={handleSubmit}>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="LECTURER">Lecturer</option>
            <option value="STUDENT">Student</option>
          </select>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="work_id"
            placeholder={
              formData.role === "STUDENT" ? "Student ID" : "Lecture ID"
            }
            value={formData.work_id}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="avatar_link"
            placeholder="Image URL"
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="btn-group">
            <button type="submit" className="btn-submit">
              Add
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAddLecture;
