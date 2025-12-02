import * as React from "react";
import "./FormSemester.scss";
import { FaPlus } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";
import { useAuth } from "../../../../context/AuthProvider";
import { createNewSemester } from "../../../../service/AdminService";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

const FormSemester = ({ onClose }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [semesterData, setSemesterData] = React.useState({
    quarter: "",
    semesterName: "",
    semesterYear: new Date().getFullYear(),
    semesterStartDate: "",
    semesterEndDate: "",
  });

  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSemesterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semesterData.semesterName.trim()) {
      toast.warning("Semester Name is required!");
      return;
    }
    if (!semesterData.semesterStartDate || !semesterData.semesterEndDate) {
      toast.warning("Please select both Start Date and End Date!");
      return;
    }
    if (
      new Date(semesterData.semesterStartDate) >=
      new Date(semesterData.semesterEndDate)
    ) {
      toast.error("End Date must be after Start Date!");
      return;
    }

    const payload = {
      quarter: semesterData.quarter,
      semesterName: semesterData.semesterName.trim(),
      semesterYear: Number(semesterData.semesterYear),
      semesterStartDate: semesterData.semesterStartDate,
      semesterEndDate: semesterData.semesterEndDate,
    };
    setLoading(true);
    try {
      await createNewSemester(payload, user.token, dispatch);
      toast.success("Semester created successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create semester");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-add-container">
      <div className="form-header">
        <h1>Add New Semester</h1>
        <IoCloseCircleSharp onClick={onClose} className="close-icon" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Quarter */}
          <div className="input-group">
            <label>Quarter</label>
            <select
              name="quarter"
              value={semesterData.quarter}
              onChange={handleChange}
              required
            >
              <option value="SP">Spring (SP)</option>
              <option value="SU">Summer (SU)</option>
              <option value="FA">Fall (FA)</option>
            </select>
          </div>

          {/* Semester Name */}
          <div className="input-group">
            <label>Semester Name</label>
            <input
              type="text"
              name="semesterName"
              value={semesterData.semesterName}
              onChange={handleChange}
              placeholder="e.g. 2025-FA"
              required
            />
          </div>

          {/* Year */}
          <div className="input-group">
            <label>Year</label>
            <input
              type="number"
              name="semesterYear"
              value={semesterData.semesterYear}
              onChange={handleChange}
              min="2000"
              max="2100"
              required
            />
          </div>

          {/* Start Date */}
          <div className="input-group">
            <label>Start Date</label>
            <input
              type="date"
              name="semesterStartDate"
              value={semesterData.semesterStartDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* End Date */}
          <div className="input-group">
            <label>End Date</label>
            <input
              type="date"
              name="semesterEndDate"
              value={semesterData.semesterEndDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-add" disabled={loading}>
            {loading ? (
              <>Creating...</>
            ) : (
              <>
                <FaPlus />
                Add Semester
              </>
            )}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSemester;
