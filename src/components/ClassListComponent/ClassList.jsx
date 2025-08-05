import React, { useEffect, useState } from "react";
import "./ClassList.scss";
import { useAuth } from "../../context/AuthProvider";
import ClassService from "../../service/ClassService";
import userApi from "../../service/UserService";
import Detailstudent from "./Detailstudent/Detailstudent";
const { getClassesByRole } = ClassService();

const ClassList = ({ handleActivityAddClass }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const itemsPerPage = 5;

  const { getUserById } = userApi();

  useEffect(() => {
    if (!user || !user.token) return;
    const fetchData = async () => {
      try {
        const data = await getClassesByRole(user.token, user.role);
        console.log("user.role", user.role);
        console.log("data", data);
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].classesId);
          setGroups(data[0].groups);
        }
      } catch (err) {
        setClasses([]);
        setGroups([]);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup("all");
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    let userIds = [];
    if (foundClass) {
      if (selectedGroup === "all") {
        foundClass.groups.forEach((group) => {
          group.groupStudents.forEach((student) => {
            userIds.push(student.userId);
          });
        });
      } else {
        const group = foundClass.groups.find(
          (g) => g.groupsId === selectedGroup
        );
        if (group) {
          userIds = group.groupStudents.map((s) => s.userId);
        }
      }
    }
    userIds = [...new Set(userIds)];
    const fetchStudents = async () => {
      const studentInfos = await Promise.all(
        userIds.map(async (id) => {
          try {
            const u = await getUserById(user.token, id);
            return {
              _id: u._id,
              name: u.full_name,
              email: u.email,
              id: u.work_id,
              avatar: u.avatar_link,
            };
          } catch {
            return null;
          }
        })
      );
      setStudents(studentInfos.filter(Boolean));
    };
    fetchStudents();
    // eslint-disable-next-line
  }, [selectedClass, selectedGroup, classes, user]);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = students.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setCurrentPage(1);
  };

  const handleShowDetail = (student) => {
    // Tìm tất cả các lớp mà student này thuộc về
    const studentClasses = classes.filter((cls) =>
      cls.groups.some((group) =>
        group.groupStudents.some((stu) => stu.userId === student._id)
      )
    );
    // Lấy danh sách tên lớp
    const classNames = studentClasses.map((cls) => cls.classesName);

    setSelectedStudent({
      ...student,
      classNames, // truyền mảng tên lớp
    });
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedStudent(null);
  };

  return (
    <div className="grades__component">
      <div className="grades__component__container">
        <div className="grades__component__container__filter__class">
          <div className="grades__component__container__filter__class__feature">
            <select value={selectedClass} onChange={handleClassChange}>
              <option>-- Choose Class --</option>
              {classes.map((cls) => (
                <option key={cls.classesId} value={cls.classesId}>
                  {cls.classesName}
                </option>
              ))}
            </select>
            <select value={selectedGroup} onChange={handleGroupChange}>
              <option value="all">Tất cả nhóm</option>
              {groups.map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
          </div>
          <div className="grades__component__container__filter__class__icon">
            <i className="fa-solid fa-file-arrow-down"></i>
            <i className="fa-solid fa-file-arrow-up"></i>
            <button onClick={handleActivityAddClass}>
              <span>Add</span>
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <div className="grades__component__container__table__list">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Student</th>
                <th>Gmail</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>
                      <p style={{ paddingTop: "15px" }}>
                        {startIndex + index + 1}
                      </p>
                    </td>
                    <td>
                      <div className="name__ava">
                        <img src={item.avatar} alt="avatar" />
                        <p>{item.name}</p>
                      </div>
                    </td>
                    <td>
                      <p>{item.email}</p>
                    </td>
                    <td>
                      <p>{item.id}</p>
                    </td>
                    <td>
                      <span onClick={() => handleShowDetail(item)}>Detail</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Oops! No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          {students.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="pagination__info">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      {showDetail && selectedStudent && (
        <Detailstudent
          student={selectedStudent}
          handleActiveDetailStudent={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default ClassList;
