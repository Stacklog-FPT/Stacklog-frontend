import "./Row.scss";
import Swal from "sweetalert2";
import { MdModeEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { upperCaseFirstChart } from "../../../helper/upperCaseFirstChart";
import FormSemester from "../FormAddLecture/Semester/FormSemester";
import FormAddLecture from "../FormAddLecture/FormAddLecture";
import { deleteSemesterService } from "../../../service/AdminService";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch } from "react-redux";
const Row = ({ role, data, semesterName, lectures, addForm, closeAdd }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  const getLecturerName = (lectureId) => {
    if (!lectures.users) return "No Lecturer";
    const lecturer = lectures.users?.find((lec) => lec._id === lectureId);
    return lecturer?.full_name || "Unknown Lecturer";
  };

  const handleDeleteSemester = async (semesterId) => {
    console.log(semesterId);
    const result = await Swal.fire({
      title: "Are you sure to delete this semester?",
      text: "This action can't completed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const resp = await await deleteSemesterService(
          semesterId,
          user.token,
          dispatch
        );

        if (resp.data === "Delete success") {
          Swal.fire(
            "Deleted!",
            "Semester was removed successfully.",
            "success"
          );
        }
      } catch (e) {
        console.error("Delete failed:", error);
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  switch (role) {
    case "Semester":
      return (
        <>
          <td>{data.semesterName || data.name || "N/A"}</td>
          <td>{formatDate(data.semesterStartDate)}</td>
          <td>{formatDate(data.semesterEndDate)}</td>
          <td className="action-cell">
            <button className="btn-edit" title="Edit">
              <MdModeEdit />
            </button>
            <button
              className="btn-delete"
              title="Delete"
              onClick={() => handleDeleteSemester(data.semesterId)}
            >
              <FaTrash />
            </button>
          </td>
          {role === "Semester" && addForm && (
            <FormSemester onClose={closeAdd} />
          )}
        </>
      );

    case "Class":
      return (
        <>
          <td>{data.classesName || data.className || "N/A"}</td>
          <td>{semesterName || "Unknown Semester"}</td>
          <td>{upperCaseFirstChart(getLecturerName(data.lectureId))}</td>
          <td className="action-cell">
            <button className="btn-edit">
              <MdModeEdit />
            </button>
            <button className="btn-delete">
              <FaTrash />
            </button>
          </td>
        </>
      );

    case "Lecture":
      return (
        <>
          <td>
            <div className="user-avatar">
              {data.avatar_link ? (
                <img src={data.avatar_link} alt={data.full_name} />
              ) : (
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  alt="avatar"
                />
              )}
              <span>{data.full_name || "Unknown"}</span>
            </div>
          </td>
          <td>{data.email || "N/A"}</td>
          <td>
            <span className={`status ${data.isActive ? "active" : "inactive"}`}>
              {data.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="action-cell">
            <button className="btn-edit">
              <MdModeEdit />
            </button>
            <button className="btn-delete">
              <FaTrash />
            </button>
          </td>

          {role === "Lecture" && addForm && (
            <FormAddLecture onClose={closeAdd} role={role} />
          )}
        </>
      );

    case "Student":
      return (
        <>
          <td>
            <div className="user-avatar">
              {data.avatar_link ? (
                <img src={data.avatar_link} alt={data.full_name} />
              ) : (
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  alt="avatar"
                />
              )}
              <span>{data.full_name || "Unknown"}</span>
            </div>
          </td>
          <td>{data.email || "N/A"}</td>
          <td>
            {data.class?.class_name || data.class?.classesName || "No class"}
          </td>
          <td className="action-cell">
            <button className="btn-edit">
              <MdModeEdit />
            </button>
            <button className="btn-delete">
              <FaTrash />
            </button>
          </td>

          {role === "Student" && addForm && (
            <FormAddLecture onClose={closeAdd} role={role} />
          )}
        </>
      );

    default:
      return (
        <td colSpan="5" className="text-center text-muted">
          Role "{role}" not supported
        </td>
      );
  }
};

export default Row;
