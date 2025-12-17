import React, { useState } from "react";
import "./ListTask.scss";
import addIcon from "../../../assets/home/list/add.png";
import recycleBin from "../../../assets/home/planDocument/delete_outline.png";
import filterList from "../../../assets/home/planDocument/filter_list.png";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const ListTask = () => {
  const personalTask = useSelector((state) => state.task.personalTask);
  const tasks = personalTask
    ? [...(personalTask.DOING || []), ...(personalTask.TODO || [])]
    : [];
  console.log(tasks);
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tasks.slice(startIndex, endIndex);
  const navigate = useNavigate();
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

  return (
    <div
      className="list__task__container mt-3"
      onClick={() => navigate("/tasks-self")}
    >
      <div className="list__task__heading">
        <div className="list__task__heading__text">
          <p className="text-center pt-3">List Task</p>
        </div>
      </div>
      <div className="list__task__table">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Team</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                {
                  /* const visibleMembers = item.members.slice(0, 3);
                const extraCount = item.members.length - visibleMembers.length; */
                }
                return (
                  <tr key={item.taskId} className="list__task__table__item">
                    <td>
                      <p>{item.taskTitle}</p>
                    </td>
                    <td>
                      {/* <ul
                        className="class__and__member__content__member__student__list"
                        data-extra-count={extraCount > 0 ? extraCount : ''}
                      >
                        {visibleMembers.map((member) => (
                          <li key={member.id}>
                            <img src={member.avatar} alt={member.name} className="member-avatar" />
                          </li>
                        ))}
                        {extraCount > 0 && (
                          <li className="extra-count">
                            <span>+{extraCount}</span>
                          </li>
                        )}
                      </ul> */}
                    </td>
                    <td>
                      {/* Priority */}
                      {item.priority}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Tasks and reminders assigned to you will show here
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {tasks.length > itemsPerPage && (
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

export default ListTask;
