import React, { useState, useEffect } from "react";
import "./ListStudent.scss";
import { useAuth } from "../../../context/AuthProvider";
import axios from "axios";

const ListStudent = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [isBan, setIsBan] = useState({});
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleGetStudents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/classes");

      if (Array.isArray(response.data) && response.data.length > 0) {
        const subjects = response.data[0]?.subjects || [];
        const allMembers = Array.from(
          new Map(
            subjects
              .flatMap((subject) => subject.members || [])
              .map((student) => [student.id, student])
          ).values()
        );

        const initialBanStatus = allMembers.reduce((acc, student) => {
          acc[student.id] = false;
          return acc;
        }, {});
        setStudents(allMembers);
        setIsBan(initialBanStatus);
      }
    } catch (e) {
      console.error("Error fetching students:", e.message);
    }
  };

  const handleToggleBan = (studentId) => {
    setIsBan((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  useEffect(() => {
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
                currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <div className="name__ava">
                        <img
                          src={
                            item.avatar_link ||
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                          }
                          alt="avatar"
                        />
                        <p>{item.name}</p>
                      </div>
                    </td>
                    <td className="text-note">{item.email}</td>
                    <td>
                      <button
                        onClick={() => handleToggleBan(item.id)}
                        className={`status-button ${
                          isBan[item.id] ? "banned" : "active"
                        }`}
                        title={isBan[item.id] ? "Unban student" : "Ban student"}
                      >
                        {isBan[item.id] ? "✗ Banned" : "✓ Active"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Students will be coming soon, don't worry.
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
