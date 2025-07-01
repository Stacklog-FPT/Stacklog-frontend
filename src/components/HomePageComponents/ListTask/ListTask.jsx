import React, { useState } from "react";
import "./ListTask.scss";
import addIcon from "../../../assets/home/list/add.png";
import recycleBin from "../../../assets/home/planDocument/delete_outline.png";
import filterList from "../../../assets/home/planDocument/filter_list.png";

const ListTask = () => {
  const taskList = [
    {
      id: 1,
      title: "Read docs to understand structure of project",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
    {
      id: 2,
      title: "Analysis and building the base of project",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
    {
      id: 3,
      title:
        "Long and Thanh Front - End, Nhat will Back - end and deployment server",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 4,
          name: "Yen",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
    {
      id: 4,
      title:
        "Long and Thanh Front - End, Nhat will Back - end and deployment server",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 4,
          name: "Yen",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
    {
      id: 5,
      title:
        "Long and Thanh Front - End, Nhat will Back - end and deployment server",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 4,
          name: "Yen",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
    {
      id: 6,
      title:
        "Long and Thanh Front - End, Nhat will Back - end and deployment server",
      members: [
        {
          id: 1,
          name: "Long",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 2,
          name: "Nhat",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 3,
          name: "Thanh",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
        {
          id: 4,
          name: "Yen",
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        },
      ],
      note: "Jan 4, 2022",
    },
  ];

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(taskList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = taskList.slice(startIndex, endIndex);

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
    <div className="list__task__container mt-3">
      <div className="list__task__heading">
        <div className="list__task__heading__text">
          <p className="text-center pt-3">List Task</p>
        </div>
        <div className="list__task__heading__feature">
          <img src={filterList} alt="this is icon..." />
          <img src={addIcon} alt="this is icon..." />
          <img src={recycleBin} alt="this is icon..." />
        </div>
      </div>
      <div className="list__task__table">
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Task</th>
              <th>Team</th>
              <th>Priority</th>
              <th>Note</th>
              <th>Process</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                const visibleMembers = item.members.slice(0, 3);
                const extraCount = item.members.length - visibleMembers.length;
                return (
                  <tr key={item.id} className="list__task__table__item">
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <p>{item.title}</p>
                    </td>
                    <td>
                      <ul
                        className="class__and__member__content__member__student__list"
                        data-extra-count={extraCount > 0 ? extraCount : ""}
                      >
                        {visibleMembers.map((member) => (
                          <li key={member.id}>
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="member-avatar"
                            />
                          </li>
                        ))}
                        {extraCount > 0 && (
                          <li className="extra-count">
                            <span>+{extraCount}</span>
                          </li>
                        )}
                      </ul>
                    </td>
                    <td>{/* Priority */}</td>
                    <td>
                      <span className="text-note">{item.note}</span>
                    </td>
                    <td>{/* Process */}</td>
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
        {taskList.length > itemsPerPage && (
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
