import * as React from "react";
import "./FormSemester.scss";
import { FaPlus } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";
import { useAuth } from "../../../../context/AuthProvider";
import { createNewSemester } from "../../../../service/AdminService";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
const FormSemester = ({ role, onClose }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [semesterData, setSemesterData] = React.useState({
    semesterId: "",
    semesterName: "",
  });

  const handleAddNewSemester = async () => {
    if (semesterData.semesterName.trim() === "") {
      toast.warning("The semester name is required!");
      return;
    }

    const payload = {
      semesterId: "",
      semesterName: semesterData.semesterName,
    };

    await createNewSemester(payload, user.token, dispatch);
  };
  return (
    <div className="form-add-container">
      <div className="form-header">
        <h1>New semester</h1>
        <IoCloseCircleSharp onClick={onClose} />
      </div>

      <form onSubmit={handleAddNewSemester}>
        <input
          type="text"
          value={semesterData.semesterName}
          onChange={(e) =>
            setSemesterData((prev) => ({
              ...prev,
              semesterName: e.target.value,
            }))
          }
          placeholder="Enter semester name"
        />
        <button className="btn-add">
          <FaPlus />
          Add
        </button>
      </form>
    </div>
  );
};

export default FormSemester;
