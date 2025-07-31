import React, { useState } from "react";
import "./FormAddLecture.scss";
import LectureService from "../../../service/LectureService";
import { useAuth } from "../../../context/AuthProvider";

const FormAddLecture = ({ onClose }) => {
  const { addLecture } = LectureService();
  const { user } = useAuth();
  console.log(user);
  const [formData, setFormData] = useState({
    full_name: "",
    work_id: "",
    email: "",
    avatar_link: "",
    description: "",
    role: "LECTURER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const response = await addLecture(user.token, payload);

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
        <h2>Add Lecture</h2>
        <form onSubmit={handleSubmit}>
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
            placeholder="Lecture ID"
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
            value={formData.avatar_link}
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
