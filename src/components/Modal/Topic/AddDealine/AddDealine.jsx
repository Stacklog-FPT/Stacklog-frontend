import React, { useState } from "react";
import "./AddDeadline.scss";
import ClassService from "../../../../service/ClassService";
import { useAuth } from "../../../../context/AuthProvider";
import { useDispatch } from "react-redux";
import {
  validateDate,
  validateDeadline,
} from "../../../../helper/validateDate";
import { toast } from "sonner";
import { useSelector } from "react-redux";
const AddDeadline = ({ currentClass, onClose }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { pending } = useSelector((state) => state.class);
  const [classData, setClassData] = useState({
    classesId: currentClass.classesId,

    deadlineAddDate: "",
    deadlineAddTime: "",

    deadlineSubmitDate: "",
    deadlineSubmitTime: "",
  });

  const buildDateTime = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  const { addDeadlineForLecuture } = ClassService();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !validateDeadline(classData.deadlineAddDate, classData.deadlineAddTime)
    ) {
      toast.warning("Add deadline must be greater than or equal to now!");
      return;
    }

    if (
      !validateDeadline(
        classData.deadlineSubmitDate,
        classData.deadlineSubmitTime
      )
    ) {
      toast.warning("Submit deadline must be greater than or equal to now!");
      return;
    }

    const payload = {
      classesId: classData.classesId,
      deadlineAdd: buildDateTime(
        classData.deadlineAddDate,
        classData.deadlineAddTime
      ),
      deadlineSubmit: buildDateTime(
        classData.deadlineSubmitDate,
        classData.deadlineSubmitTime
      ),
    };

    if (!payload.deadlineAdd || !payload.deadlineSubmit) {
      toast.warning("Please select both date and time");
      return;
    }

    const resp = await addDeadlineForLecuture(user.token, payload, dispatch);
    if (resp) {
      toast.success("Save deadline successfully!");
      onClose();
    }
  };

  return (
    <div className="add-deadline">
      <form className="add-deadline__form" onSubmit={handleSubmit}>
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="add-deadline__title">Set Submission Deadlines</h3>
        </div>

        <div className="add-deadline__field">
          <label>Deadline submit topic</label>
          <div className="add-deadline__datetime">
            <input
              type="date"
              name="deadlineAddDate"
              value={classData.deadlineAddDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="deadlineAddTime"
              value={classData.deadlineAddTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="add-deadline__field">
          <label>Deadline submit document</label>
          <div className="add-deadline__datetime">
            <input
              type="date"
              name="deadlineSubmitDate"
              value={classData.deadlineSubmitDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="deadlineSubmitTime"
              value={classData.deadlineSubmitTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="add-deadline__actions">
          <button type="submit" className="btn-primary">
            {pending ? "Saving..." : "Submit"}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddDeadline;
