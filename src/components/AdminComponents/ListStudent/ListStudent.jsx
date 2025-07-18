import React from "react";
import "./ListStudent.scss";
import { useAuth } from "../../../context/AuthProvider";
import userApi from "../../../service/UserService";
const ListStudent = () => {
  const { user } = useAuth();
  const { getUserByRole } = userApi();
  const [students, setStudents] = React.useState([]);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = students.slice(startIndex, endIndex);

  //
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGetStudents = async () => {
    try {
      const response = await getUserByRole(user.token, "student");
      if (response) {
        setStudents(response?.data?.users);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  React.useEffect(() => {
    handleGetStudents();
  }, []);

  return (
    <div className="list__student__container">
      <div className="list__student">
        <div className="list__student__heading">
          <div className="list__student__heading__title">
            <h2>Manage Student</h2>
          </div>

          <div className="list__student__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="list__student__table">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => {
                  return (
                    <tr key={item.id} className="list__task__table__item">
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <div className="name__ava">
                          {item?.avatar_link ? (
                            <img src={item?.avatar_link} />
                          ) : (
                            <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
                          )}

                          <p>{item.full_name}</p>
                        </div>
                      </td>
                      <td className="text-note">{item.email}</td>
                      <td>
                        <span></span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Student will coming soon, don't worry
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default ListStudent;
