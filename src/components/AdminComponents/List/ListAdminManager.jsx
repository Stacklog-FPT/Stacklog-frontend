// src/components/ListAdminManager/ListSemester.jsx
import { useEffect, useState } from "react";
import "./ListAdminManager.scss";
import {
  getAllClasses,
  getAllLecture,
  getAllSemester,
} from "../../../service/AdminService";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { upperCaseFirstChart } from "../../../helper/upperCaseFirstChart";
import Row from "../Row/Row";

const ListAdminManager = ({ role }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [showAddForm, setShowAddForm] = useState(false);
  const { semesters, classes, lectures, pending } = useSelector(
    (state) => state.users
  );

  const [showUi, setShowUi] = useState({
    row1: "",
    row2: "",
    row3: "",
    row4: "Action",
  });

  const [selectedSemester, setSelectedSemester] = useState({
    semesterId: "",
    semesterName: "",
  });

  const [selectedClass, setSelectedClass] = useState({
    classesId: "",
    classesName: "",
  });

  const dataByRole = {
    Semester: semesters,
    Class: classes,
    Lecture: lectures.users,
    Student: [],
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const currentData = dataByRole[role] || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const isClassWithoutSemester =
    role === "Class" && !selectedSemester.semesterId;

  const showUIByRole = () => {
    switch (role) {
      case "Semester":
        setShowUi({
          row1: "Semester",
          row2: "Start Date",
          row3: "End Date",
          row4: "Action",
        });
        break;
      case "Class":
        setShowUi({
          row1: "Class Name",
          row2: "Semester",
          row3: "Lecture",
          row4: "Action",
        });
        break;
      case "Lecture":
        setShowUi({
          row1: "Lecture",
          row2: "Email",
          row3: "Status",
          row4: "Action",
        });
        break;
      case "Student":
        setShowUi({
          row1: "Student",
          row2: "Email",
          row3: "Class",
          row4: "Action",
        });
        break;
      default:
        setShowUi({ row1: "", row2: "", row3: "", row4: "Action" });
    }
  };

  const handleSemesterChange = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedSemester({ semesterId: "", semesterName: "" });
      return;
    }

    const selected = semesters.find((sem) => sem.semesterId === id);
    console.log(selected);
    setSelectedSemester({
      semesterId: selected.semesterId || "",
      semesterName: selected.semesterName || "Unknown",
    });
  };

  const handleClassesChange = (e) => {
    const id = e.target.value;
    if (!id) {
      selectedClass({ classesId: "", classesName: "" });
      return;
    }

    const selected = classes.find((item) => item.classesId === id);
    setSelectedClass({
      classesId: selected.classesId || "",
      classesName: selected.classesName || "Unknown",
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  };

  const showAddClose = () => {
    setShowAddForm(false);
  };

  useEffect(() => {
    if (!user?.token) return;

    if (role === "Semester") {
      getAllSemester(user.token, dispatch);
    }

    showUIByRole();
    setCurrentPage(1);
    setSelectedSemester({ semesterId: "", semesterName: "" });
  }, [role, user?.token, dispatch]);

  useEffect(() => {
    if (role === "Class" && selectedSemester.semesterId && user?.token) {
      getAllClasses(selectedSemester.semesterId, user.token, dispatch);
      getAllLecture(user.token, dispatch);
    } else if (role === "Lecture") {
      getAllLecture(user.token, dispatch);
    } else if (role === "Student") {
      getAllClasses(selectedSemester.semesterId, user.token, dispatch);
    }
  }, [selectedSemester.semesterId, role, user?.token, dispatch]);

  return (
    <div className="list__semester__container">
      <div className="list__semester">
        <div className="list__semester__heading">
          <div className="list__semester__heading__title">
            <h2>
              Manage {upperCaseFirstChart(role)}
              {role === "Class" && selectedSemester.semesterName && (
                <span className="subtitle">
                  {" "}
                  — {selectedSemester.semesterName}
                </span>
              )}
              {role === "Student" && selectedClass.classesName && (
                <span className="subtitle"> — {selectedClass.classesName}</span>
              )}
            </h2>
          </div>

          <div className="list__semester__heading__feature">
            {role === "Class" && (
              <select
                value={selectedSemester.semesterId}
                onChange={handleSemesterChange}
                className="semester-select"
              >
                <option value="">-- Select Semester --</option>
                {semesters.map((sem) => (
                  <option key={sem.semesterId} value={sem.semesterId}>
                    {sem.semesterName}
                  </option>
                ))}
              </select>
            )}
            {role === "Student" && (
              <select
                value={selectedClass.classesId}
                onChange={handleClassesChange}
                className="semester-select"
              >
                <option value="">-- Select Class --</option>
                {classes.map((sem) => (
                  <option key={sem.classesId} value={sem.classesId}>
                    {sem.classesName}
                  </option>
                ))}
              </select>
            )}
            <i className="fa-solid fa-filter"></i>
            <i
              className="fa-solid fa-plus"
              style={{ cursor: "pointer" }}
              onClick={() => setShowAddForm({ flag: true, role: role })}
            ></i>
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
                <th>{showUi.row4}</th>
              </tr>
            </thead>
            <tbody>
              {pending ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : isClassWithoutSemester ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Please select a semester to view classes
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <Row
                      role={role}
                      data={item}
                      semesterName={selectedSemester.semesterName}
                      lectures={lectures}
                      addForm={showAddForm.flag}
                      closeAdd={showAddClose}
                    />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No {role.toLowerCase()} available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && !pending && !isClassWithoutSemester && (
            <div className="modern-pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn prev"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={i} className="dots">
                      ...
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "active" : ""}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <div className="page-info">
                Page <strong>{currentPage}</strong> / {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn next"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAdminManager;
