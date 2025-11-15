// src/components/ListAdminManager/ListSemester.jsx
import { useEffect, useState } from "react";
import "./ListAdminManager.scss";
import { getAllClasses, getAllSemester } from "../../../service/AdminService";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { upperCaseFirstChart } from "../../../helper/upperCaseFirstChart";
import Row from "../Row/Row";

const ListAdminManager = ({ role }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { semesters, classes } = useSelector((state) => state.users);

  const [showUi, setShowUi] = useState({ row1: "", row2: "", row3: "" });
  const [isShowAdd, setIsShowAdd] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mapping dữ liệu
  const dataByRole = {
    Semester: semesters,
    Class: classes,
    Lecture: [],
    Student: [],
  };

  const handleGetDataByRole = async () => {
    switch (role) {
      case "Semester":
        await getAllSemester(user.token, dispatch);
        break;
      case "Class":
        if (selectedSemesterId) {
          await getAllClasses(selectedSemesterId, user.token, dispatch);
          break;
        }
      case "Lecture":
    }
  };

  const currentData = dataByRole[role] || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const showUIByRole = () => {
    switch (role) {
      case "Semester":
        setShowUi({ row1: "Semester", row2: "Start Date", row3: "End Date" });
        break;
      case "Class":
        setShowUi({ row1: "Class", row2: "Semester", row3: "Lecture" });
        break;
      case "Lecture":
        setShowUi({ row1: "Lecture", row2: "Email", row3: "Status" });
        break;
      case "Student":
        setShowUi({ row1: "Student", row2: "Email", row3: "Class" });
        break;
      default:
        setShowUi({});
    }
  };

  useEffect(() => {
    showUIByRole();
    setCurrentPage(1);
    setSelectedSemesterId("");
    handleGetDataByRole();
  }, [role]);

  // useEffect(() => {
  //   if (!user?.token) return;

  //   if (role === "Semester") {
  //     getAllSemester(user.token, dispatch);
  //   } else if (role === "Class" && semesters.length === 0) {
  //     getAllSemester(user.token, dispatch);
  //   }
  // }, [role, user?.token, dispatch]);

  useEffect(() => {
    if (role === "Class" && selectedSemesterId) {
      console.log("Selected semester debug: ", selectedSemesterId);
      getAllClasses(selectedSemesterId, user.token, dispatch);
    }
  }, [selectedSemesterId, role]);

  return (
    <div className="list__semester__container">
      <div className="list__semester">
        <div className="list__semester__heading">
          <div className="list__semester__heading__title">
            <h2>Manage {upperCaseFirstChart(role)}</h2>
          </div>

          <div className="list__semester__heading__feature">
            {role === "Class" && (
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="semester-select"
              >
                {semesters.map((sem) => (
                  <option key={sem._id} value={sem._id}>
                    {sem.semesterName || sem.name}
                  </option>
                ))}
              </select>
            )}

            <i className="fa-solid fa-filter"></i>
            <i
              className="fa-solid fa-plus"
              onClick={() => setIsShowAdd(true)}
            ></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>

        <div className="list__semester__table">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>{showUi.row1}</th>
                <th>{showUi.row2}</th>
                <th>{showUi.row3}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item._id} className="list__task__table__item">
                    <Row role={role} data={item} />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    {role === "Class" && !selectedSemesterId
                      ? "Please select the semester"
                      : `No ${role.toLowerCase()} available`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="pagination__info">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAdminManager;
