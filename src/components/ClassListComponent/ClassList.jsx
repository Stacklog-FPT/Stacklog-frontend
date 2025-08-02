import React, { useEffect, useState } from "react";
import "./ClassList.scss";
import { useAuth } from "../../context/AuthProvider";
import ClassService from "../../service/ClassService";
import userApi from "../../service/UserService";

const ClassList = ({ handleActivityAddClass, handleActiveDetailStudent }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [area, setArea] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // GỌI HOOK Ở ĐÂY, KHÔNG GỌI TRONG fetchData
  const { getUserById } = userApi();

  useEffect(() => {
    if (!user || !user.token) {
      console.warn("No user or token!");
      return;
    }
    const fetchData = async () => {
      try {
        const classService = ClassService();
        const data = await classService.getMembersInClass(user.token);

        // Lấy tất cả userId của học sinh trong các group
        let userIds = [];
        let classList = [];
        let areaList = [];
        data.forEach((classItem) => {
          classList.push({
            _id: classItem.classesId,
            name: classItem.classesName,
          });
          areaList.push({
            _id: classItem.classesId,
            name: classItem.groups?.[0]?.groupsName || "",
          });
          classItem.groups.forEach((group) => {
            group.groupStudents.forEach((student) => {
              userIds.push(student.userId);
            });
          });
        });
        setClasses(classList);
        setArea(areaList);

        // Loại bỏ userId trùng lặp
        userIds = [...new Set(userIds)];

        // Lấy thông tin từng user
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
            } catch (e) {
              return null;
            }
          })
        );
        setStudents(studentInfos.filter(Boolean));
      } catch (err) {
        console.error("API error:", err);
        setStudents([]);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [user]);

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

  return (
    <div className="grades__component">
      <div className="grades__component__container">
        <div className="grades__component__container__filter__class">
          <div className="grades__component__container__filter__class__feature">
            <select>
              {classes.map((item) => (
                <option key={item._id}>{item.name}</option>
              ))}
            </select>
            <select>
              {area.map((item) => (
                <option key={item._id}>{item.name}</option>
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
                  <tr key={item._id}>
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
                      <span onClick={handleActiveDetailStudent}>Detail</span>
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
    </div>
  );
};
export default ClassList;