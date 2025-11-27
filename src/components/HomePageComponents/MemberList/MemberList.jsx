import React from "react";
import "./MemberList.scss";
import { useSelector } from "react-redux";
const MemberList = () => {
  const classes = useSelector((state) => state.class.classes);
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const selectedClass = classes.find(
    (cls) => cls.classesId === selectedClassId
  );

  const [members, setMemebers] = React.useState([
    {
      _id: "DE170481",
      full_name: "Long Bua Dinh",
      ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
      gmail: "longlhde170481@gmail.com",
    },
    {
      _id: "DE170482",
      full_name: "Master Tran",
      ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
      gmail: "vuttde170482@gmail.com",
    },
    {
      _id: "DE170483",
      full_name: "Nhat Thum Thim",
      ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
      gmail: "nhattv170483@gmail.com",
    },
    {
      _id: "DE170484",
      full_name: "Thanh 52 cay",
      ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
      gmail: "thanhtc170484@gmail.com",
    },
    {
      _id: "DE170485",
      full_name: "Viet Dau An",
      ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
      gmail: "vietda170485@gmail.com",
    },
  ]);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = members.slice(startIndex, endIndex);

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
    <div className="member__list">
      <div className="member__list__container">
        <div className="member__list__heading">
          <div className="member__list__heading__title">
            <h2>Member List</h2>
          </div>

          <div className="member__list__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="member__list__feature">
          <div className="member__list__feature__filter">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((item) => {
                return (
                  <option key={item.classesId} value={item.classesId}>
                    {item.classesName}
                  </option>
                );
              })}
            </select>
            <select>
              {(selectedClass
                ? selectedClass.groups
                : classes.flatMap((cls) => cls.groups)
              ).map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="member__list__table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Student</th>
                <th>ID</th>
                <th>Gmail</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                return (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="name__ava">
                        {item?.ava ? (
                          <img src={item?.ava} />
                        ) : (
                          <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
                        )}

                        <p>{item.full_name}</p>
                      </div>
                    </td>
                    <td>{item._id}</td>
                    <td className="text-note">{item.gmail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination">
        {members.length > itemsPerPage && (
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

export default MemberList;
