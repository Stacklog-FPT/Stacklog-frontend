import React from "react";
import "./ListLecture.scss";
import { useAuth } from "../../../context/AuthProvider";
import userApi from "../../../service/UserService";
import axios from "axios";
const ListLecture = () => {
  const [lectures, setLectures] = React.useState([]);
  const { user } = useAuth();
  const { getUserByRole } = userApi();
  const itemsPerPage = 9;
  const totalPages = Math.ceil(lectures.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = lectures.slice(startIndex, endIndex);
  // const handleGetLectures = async () => {
  //   const resp = await getUserByRole(user?.token, "lecture");
  //   if (resp) {
  //     setLectures(resp);
  //   }
  // };

  const handleGetLectures = async () => {
    try {
      const response = await axios.get("http://localhost:3000/lectures");
      if (response) {
        setLectures(response.data);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

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
  React.useEffect(() => {
    handleGetLectures();
  }, []);
  return (
    <div className="list__lecture__container">
      <div className="list__lecture">
        <div className="list__lecture__heading">
          <div className="list__lecture__heading__title">
            <h2>Manage Lecture</h2>
          </div>

          <div className="list__lecture__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="list__lecture__table">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Lecture</th>
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

                          <p>{item.name}</p>
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
      </div>
    </div>
  );
};

export default ListLecture;
