// FormAddNewClass.jsx
import React from "react";
import "./FormAddNewClass.scss";
import { FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { createNewClass } from "../../../service/AdminService";
import { useDispatch, useSelector } from "react-redux";
const FormAddNewClass = ({ lectures = [], user, onClose }) => {
  const [newClass, setNewClass] = React.useState({
    classId: "",
    className: "",
    lectureId: "",
    semesterId: "",
  });

  console.log(lectures);
  const dispatch = useDispatch();
  const { semesters, pending } = useSelector((state) => state.users);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Call me submit");
    if (
      !newClass.classId.trim() ||
      !newClass.className.trim() ||
      !newClass.lectureId ||
      !newClass.semesterId
    ) {
      toast.error("All input are required!");
      return;
    }

    const payload = {
      classId: "",
      className: newClass.className,
      semesterId: newClass.semesterId,
      lectureId: newClass.lectureId,
    };

    console.log(payload);
    const response = await createNewClass(payload, user, dispatch);

    console.log(response);
  };

  return (
    <div className="form-add-overlay" onClick={onClose}>
      <div className="form-add-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-header">
          <h1>Add new class</h1>
          <div className="close-icon" onClick={onClose}>
            <FaTimes />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="className">
                ClassName: <span className="required">*</span>
              </label>
              <input
                type="text"
                id="className"
                name="className"
                value={newClass.className}
                onChange={handleChange}
                required
              />
            </div>

            {/* Kỳ học */}
            <div className="input-group">
              <label htmlFor="semesterId">
                Semester <span className="required">*</span>
              </label>
              <select
                id="semesterId"
                name="semesterId"
                value={newClass.semesterId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Semester--</option>
                {semesters.map((sem) => (
                  <option key={sem.semesterId} value={sem.semesterId}>
                    {sem.semesterName} ({sem.semesterYear})
                  </option>
                ))}
              </select>
            </div>

            {/* Giảng viên */}
            <div className="input-group">
              <label htmlFor="lectureId">
                Lecture <span className="required">*</span>
              </label>
              <select
                id="lectureId"
                name="lectureId"
                value={newClass.lectureId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select lecture --</option>
                {lectures.map((lec) => (
                  <option key={lec._id} value={lec._id}>
                    {lec.full_name} ({lec.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancle
            </button>
            <button type="submit" className="btn-add">
              <FaPlus />
              {pending ? "Adding...." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAddNewClass;
