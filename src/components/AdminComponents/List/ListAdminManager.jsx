import { useEffect, useState } from "react";
import "./ListAdminManager.scss";
import {
  getAllAdminDataOnce,
  getAllClasses,
  getAllLecture,
  getAllSemester,
  getAllStudent,
} from "../../../service/AdminService";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { upperCaseFirstChart } from "../../../helper/upperCaseFirstChart";
import Row from "../Row/Row";
import { BiExport } from "react-icons/bi";
import { CgImport } from "react-icons/cg";
import { exportByRole } from "../../../service/ExportImportService";
import downloadFile from "../../../helper/downloadFile";
import { toast } from "sonner";
import FormExcel from "../FormExcel/FormExcel";
import FormAddLecture from "../FormAddLecture/FormAddLecture";
import FormSemester from "../FormAddLecture/Semester/FormSemester";
import LoadingComponent from "../../Loading/LoadingComponent";
import FormAddNewClass from "../FormAddNewClass/FormAddNewClass";

const ListAdminManager = ({ role }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [addFormType, setAddFormType] = useState(null);
  const [showAddExcel, setShowAddExcel] = useState(false);
  const { semesters, classes, lectures, pending, students } = useSelector(
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
  const dataByRole = {
    Semester: semesters,
    Class: classes,
    Lecture: lectures.users,
    Student: students.users,
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const currentData = dataByRole[role];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const [exporting, setExporting] = useState(false);
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
          row3: "Course",
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
    setSelectedSemester({
      semesterId: selected.semesterId || "",
      semesterName: selected.semesterName || "Unknown",
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

  const handleExportByRole = async () => {
    if (exporting) return;
    setExporting(true);

    const roleForLecture = role === "Lecture" ? "lecturer" : role;
    try {
      const result = await exportByRole(
        roleForLecture.toUpperCase(),
        user.token
      );

      downloadFile(
        result.data,
        `${role.toLowerCase()}_export.xlsx`,
        result.contentType,
        result.headers
      );

      toast.success(`Downloaded ${result.filename} successfully! `);
    } catch (e) {
      toast.error("Something went wrong! ");
    } finally {
      setExporting(false);
    }
    await exportByRole(role.toUpperCase(), user.token);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAllAdminDataOnce(user.token, dispatch);
    };

    fetchData();
  }, [user.token]);

  useEffect(() => {
    if (role === "Class" && selectedSemester.semesterId && user?.token) {
      getAllClasses(selectedSemester.semesterId, user.token, dispatch);
    }
  }, [selectedSemester.semesterId, role, user?.token, dispatch]);

  // useEffect(() => {
  //   if (
  //     role === "Class" &&
  //     semesters.length > 0 &&
  //     !selectedSemester.semesterId
  //   ) {
  //     const latestSemester = semesters.reduce((latest, current) => {
  //       if (current.semesterYear > latest.semesterYear) return current;
  //       if (current.semesterYear < latest.semesterYear) return latest;

  //       const order = { FA: 3, SP: 2, SU: 1 };
  //       return (order[current.quarter] || 0) > (order[latest.quarter] || 0)
  //         ? current
  //         : latest;
  //     }, semesters[0]);

  //     setSelectedSemester({
  //       semesterId: latestSemester.semesterId,
  //       semesterName: latestSemester.semesterName,
  //     });
  //   }
  // }, [role, semesters, selectedSemester.semesterId]);
  return (
    <>
      <LoadingComponent isLoading={pending} />
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
                {role === "Student" && (
                  <span>
                    <span> </span>K{students.users[0].work_id.slice(2, 4)}
                    {role === "Class" && selectedSemester.semesterName && (
                      <span className="subtitle">
                        {" "}
                        — {selectedSemester.semesterName}
                      </span>
                    )}
                  </span>
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
                  <option>-- Select Semester --</option>
                  {semesters.map((sem) => (
                    <option key={sem.semesterId} value={sem.semesterId}>
                      {sem.semesterName} ({sem.semesterYear})
                    </option>
                  ))}
                </select>
              )}
              <i className="fa-solid fa-filter"></i>
              <i
                className="fa-solid fa-plus"
                style={{ cursor: "pointer" }}
                onClick={() => setAddFormType(role)}
              ></i>
              {["Lecture", "Student"].includes(role) && (
                <button
                  className="export-btn"
                  onClick={handleExportByRole}
                  title="Export to Excel"
                >
                  <BiExport size={20} />
                </button>
              )}
              {["Lecture", "Student"].includes(role) && (
                <button
                  className="export-btn"
                  onClick={() => setShowAddExcel(true)}
                  title="Import to Excel"
                >
                  <CgImport size={20} />
                </button>
              )}
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
      {addFormType === "Semester" && (
        <FormSemester onClose={() => setAddFormType(null)} />
      )}

      {addFormType === "Class" && (
        <FormAddNewClass
          onClose={() => setAddFormType(null)}
          user={user.token}
          lectures={dataByRole.Lecture}
        />
      )}

      {(addFormType === "Lecture" || addFormType === "Student") && (
        <FormAddLecture
          onClose={() => setAddFormType(null)}
          role={addFormType}
        />
      )}
    </>
  );
};

export default ListAdminManager;
