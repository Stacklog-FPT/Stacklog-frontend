import { useState, useEffect, useRef } from "react";
import { role } from "react";
import "./ListAdminManager.scss";
import {
  getAllAdminDataOnce,
  getAllClasses,
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
import FilterModal from "../FilterModal/FilterModal";

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
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);

  const filterRef = useRef(null);

  const dataByRole = {
    Semester: semesters,
    Class: classes,
    Lecture: lectures.users || [],
    Student: students.users || [],
  };

  useEffect(() => {
    let options = [];

    switch (role) {
      case "Semester":
        options = [
          { id: "cur", label: "Current Year (2025)", value: "current-year" },
          { id: "asc", label: "Asc by year", value: "asc-year" },
          { id: "desc", label: "Desc by year", value: "desc-year" },
          { id: "fa", label: "Fall semester (FA)", value: "FA" },
          { id: "su", label: "Summer semester(SU)", value: "SU" },
          { id: "sp", label: "Spring semester(SP)", value: "SP" },
        ];
        break;

      case "Lecture":
        options = [
          { id: "az", label: "Sort Name A to Z", value: "az" },
          { id: "za", label: "Sort Name Z to A", value: "za" },
        ];
        break;

      case "Student":
        options = [
          { id: "az", label: "Sort Name A to Z", value: "az" },
          { id: "za", label: "Sort Name Z to A", value: "za" },
          {
            id: "work-asc",
            label: "Sort Work ID Ascending",
            value: "work-asc",
          },
          {
            id: "work-desc",
            label: "Sort Work ID Descending",
            value: "work-desc",
          },
        ];
        break;

      case "Class":
        options = [
          { id: "has-lec", label: "Have lecture", value: "has-lecture" },
          { id: "no-lec", label: "Don't have lecture", value: "no-lecture" },
          {
            id: "class-az",
            label: "Sort Class Name A to Z",
            value: "class-az",
          },
          {
            id: "class-za",
            label: "Sort Class Name Z to A",
            value: "class-za",
          },
          {
            id: "newest",
            label: "Created Date – Newest First",
            value: "created-newest",
          },
          {
            id: "oldest",
            label: "Created Date – Oldest First",
            value: "created-oldest",
          },
        ];
        break;

      default:
        options = [];
    }

    setFilterOptions(options);
    setSelectedFilters([]);
  }, [role]);

  const getFilteredData = () => {
    let data = [...(dataByRole[role] || [])];
    console.log(data);
    if (selectedFilters.length === 0) return data;

    switch (role) {
      // === SEMESTER ===
      case "Semester":
        if (selectedFilters.includes("current-year"))
          data = data.filter((s) => s.semesterYear === 2025);
        if (selectedFilters.includes("FA"))
          data = data.filter((s) => s.quarter === "FA");
        if (selectedFilters.includes("SU"))
          data = data.filter((s) => s.quarter === "SU");
        if (selectedFilters.includes("SP"))
          data = data.filter((s) => s.quarter === "SP");
        if (selectedFilters.includes("asc-year"))
          data.sort((a, b) => (a.semesterYear || 0) - (b.semesterYear || 0));
        if (selectedFilters.includes("desc-year"))
          data.sort((a, b) => (b.semesterYear || 0) - (a.semesterYear || 0));
        break;

      // === LECTURE & STUDENT:
      case "Lecture":
      case "Student":
        if (selectedFilters.includes("az")) {
          data.sort((a, b) =>
            (a.full_name || "").localeCompare(b.full_name || "")
          );
        }
        if (selectedFilters.includes("za")) {
          data.sort((a, b) =>
            (b.full_name || "").localeCompare(a.full_name || "")
          );
        }
        break;

      // === CLASS ===
      case "Class":
        if (selectedFilters.includes("has-lecture"))
          data = data.filter((c) => c.lectureId);
        if (selectedFilters.includes("no-lecture"))
          data = data.filter((c) => !c.lectureId);
        if (selectedFilters.includes("class-az")) {
          data.sort((a, b) =>
            (a.classesName || a.className || "").localeCompare(
              b.classesName || b.className || ""
            )
          );
        }
        if (selectedFilters.includes("class-za")) {
          data.sort((a, b) =>
            (b.classesName || b.className || "").localeCompare(
              a.classesName || a.className || ""
            )
          );
        }
        if (selectedFilters.includes("created-newest")) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        if (selectedFilters.includes("created-oldest")) {
          data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        break;
    }

    return data;
  };
  const displayData = getFilteredData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = displayData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayData.length / itemsPerPage);

  const [exporting, setExporting] = useState(false);
  const isClassWithoutSemester =
    role === "Class" && !selectedSemester.semesterId;

  const handleFilterChange = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );

    setCurrentPage(1);
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

  const handleGetUiHead = () => {
    switch (role) {
      case "Semester":
        setShowUi((prev) => ({
          ...prev,
          row1: "Semster",
          row2: "Start date",
          row3: "End date",
        }));
        break;
      case "Class":
        setShowUi((prev) => ({
          ...prev,
          row1: "Class Name",
          row2: "Semester",
          row3: "Lecture",
        }));
        break;
      case "Lecture":
        setShowUi((prev) => ({
          ...prev,
          row1: "Lecture",
          row2: "Email",
          row3: "Status",
        }));
        break;
      case "Student":
        setShowUi((prev) => ({
          ...prev,
          row1: "Student",
          row2: "Email",
          row3: "Intake",
          row4: "Status",
        }));
        break;
      default:
        break;
    }
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
      toast.success(`Downloaded ${result.filename} successfully!`);
    } catch (e) {
      toast.error("Something went wrong!");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    getAllAdminDataOnce(user.token, dispatch);
  }, [user.token, dispatch]);

  useEffect(() => {
    if (role === "Class" && selectedSemester.semesterId && user?.token) {
      getAllClasses(selectedSemester.semesterId, user.token, dispatch);
    }
    handleGetUiHead();
  }, [selectedSemester.semesterId, role, user?.token, dispatch]);

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
                {role === "Student" && students.users[0]?.work_id && (
                  <span> K{students.users[0].work_id.slice(2, 4)}</span>
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
              <div style={{ position: "relative", display: "inline-block" }}>
                <i
                  className="fa-solid fa-filter"
                  ref={filterRef}
                  onClick={() => setIsShowFilter(!isShowFilter)}
                  style={{
                    cursor: "pointer",
                    fontSize: "18px",
                    color: selectedFilters.length > 0 ? "#045745" : "#666",
                  }}
                ></i>
                {selectedFilters.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      background: "#045745",
                      color: "white",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "11px",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {selectedFilters.length}
                  </span>
                )}
              </div>

              <i
                className="fa-solid fa-plus"
                style={{ cursor: "pointer", marginLeft: "12px" }}
                onClick={() => setAddFormType(role)}
              ></i>

              {["Lecture", "Student"].includes(role) && (
                <>
                  <button
                    className="export-btn"
                    onClick={handleExportByRole}
                    title="Export to Excel"
                  >
                    <BiExport size={20} />
                  </button>
                  <button
                    className="export-btn"
                    onClick={() => setShowAddExcel(true)}
                    title="Import to Excel"
                  >
                    <CgImport size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="list__semester__table">
            <table>
              <thead>
                <tr>
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
                    <tr key={item._id || item.semesterId}>
                      <Row
                        role={role}
                        data={item}
                        semesterName={selectedSemester.semesterName}
                        lectures={lectures}
                        closeAdd={() => {}}
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
          </div>
        </div>
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn next"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* CÁC FORM */}
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
      {showAddExcel && (
        <FormExcel role={role} onClose={() => setShowAddExcel(false)} />
      )}

      {isShowFilter && filterOptions.length > 0 && (
        <FilterModal
          isOpen={isShowFilter}
          onClose={() => setIsShowFilter(false)}
          anchorRef={filterRef}
          filters={filterOptions}
          role={role}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      )}
    </>
  );
};

export default ListAdminManager;
