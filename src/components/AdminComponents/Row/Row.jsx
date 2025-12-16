import "./Row.scss";
import Swal from "sweetalert2";
import { MdModeEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { upperCaseFirstChart } from "../../../helper/upperCaseFirstChart";
import FormSemester from "../FormAddLecture/Semester/FormSemester";
import { deleteSemesterService, lockUser } from "../../../service/AdminService";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { exportClassAndDownload } from "../../../service/ClassService";
import ExportXlsxButton from '../../ExportXlsxButton/ExportXlsxButton'
import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";

const Row = ({
  role,
  data,
  semesterName,
  lectures,
  addForm,
  closeAdd,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  if (isLoading || !data) {
    return (
      <tr>
        {role === "Semester" && (
          <>
            <td>
              <Skeleton width={120} />
            </td>
            <td>
              <Skeleton width={100} />
            </td>
            <td>
              <Skeleton width={100} />
            </td>
            <td className="action-cell">
              <Skeleton
                circle
                width={36}
                height={36}
                inline
                style={{ marginRight: 8 }}
              />
              <Skeleton circle width={36} height={36} />
            </td>
          </>
        )}

        {role === "Class" && (
          <>
            <td>
              <Skeleton width={130} />
            </td>
            <td>
              <Skeleton width={110} />
            </td>
            <td>
              <Skeleton width={140} />
            </td>
            <td className="action-cell">
              <Skeleton
                circle
                width={36}
                height={36}
                inline
                style={{ marginRight: 8 }}
              />
              <Skeleton circle width={36} height={36} />
            </td>
          </>
        )}

        {(role === "Lecture" || role === "Student") && (
          <>
            <td>
              <div
                className="user-avatar"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <Skeleton circle width={40} height={40} />
                <Skeleton width={120} />
              </div>
            </td>
            <td>
              <Skeleton width={180} />
            </td>
            <td>
              <Skeleton width={role === "Lecture" ? 80 : 100} />
            </td>
            <td className="action-cell">
              <Skeleton
                circle
                width={36}
                height={36}
                inline
                style={{ marginRight: 8 }}
              />
              <Skeleton circle width={36} height={36} />
            </td>
          </>
        )}
      </tr>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  const getLecturerName = (lectureId) => {
    if (!lectures?.users) return "No Lecturer";
    const lecturer = lectures.users.find((lec) => lec._id === lectureId);
    return lecturer?.full_name || "Unknown Lecturer";
  };

  const handleCheckDateToDelete = (semesterStartDate) => {
    if (!semesterStartDate) {
      return false;
    }

    const startDate = new Date(semesterStartDate);
    if (isNaN(startDate.getTime())) {
      return false;
    }

    const currentDate = new Date();

    if (currentDate >= startDate) {
      return false;
    }

    return true;
  };

  const handleDeleteSemester = async (semesterId) => {
    const result = await Swal.fire({
      title: "Are you sure to delete this semester?",
      text: "This action can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const resp = await deleteSemesterService(
          semesterId,
          user.token,
          dispatch
        );
        console.log(resp);
        // if (resp.status === 200) {
        //   Swal.fire(
        //     "Deleted!",
        //     "Semester was removed successfully.",
        //     "success"
        //   );
        // }
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  const handleLockAccount = async (userId) => {
    const result = await Swal.fire({
      title: `Are you sure to  ${
        data.isActive ? "lock" : "unlock"
      } this account?`,
      text: "This action can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Lock",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const resp = await lockUser(user.token, userId);
        if (resp.status === 200) {
          Swal.fire(
            "Success!",
            `Account has been ${
              data.isActive ? "locked" : "unlocked"
            } successfully.`,
            "success"
          );
        }
      } catch (e) {
        console.error("Lock/Unlock failed:", e);
        Swal.fire(
          "Error!",
          "Something went wrong during the process.",
          "error"
        );
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
            {handleCheckDateToDelete(data.semesterStartDate) && (
              <button
                className="btn-delete"
                title="Delete"
                onClick={() => handleDeleteSemester(data.semesterId)}
              >
                <FaTrash />
              </button>
            )}
          </td>
          {addForm && <FormSemester onClose={closeAdd} />}
        </>
      );

    case "Class":
      return (
        <>
          <td>{data.classesName || data.className || "N/A"}</td>
          <td>{semesterName || "Unknown Semester"}</td>
          <td>{upperCaseFirstChart(getLecturerName(data.lectureId))}</td>
          <td className="action-cell">
            <button className="btn-success" onClick={async() => {
              await exportClassAndDownload(data?.classesId, user.token);
            }} >
              Export
            </button>
            {/* <ExportXlsxButton data={data} /> */}
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
            <button className="btn-delete">
              {data.isActive ? (
                <CiLock onClick={() => handleLockAccount(data._id)} />
              ) : (
                <CiUnlock onClick={() => handleLockAccount(data._id)} />
              )}
            </button>
          </td>
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
          <td>K{data?.work_id?.slice(2, 4)}</td>
          <td>
            <span className={`status ${data.isActive ? "active" : "inactive"}`}>
              {data.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="action-cell">
            <button className="btn-delete" title="Delete">
              {data.isActive ? (
                <CiLock onClick={() => handleLockAccount(data._id)} />
              ) : (
                <CiUnlock onClick={() => handleLockAccount(data._id)} />
              )}
            </button>
          </td>
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
