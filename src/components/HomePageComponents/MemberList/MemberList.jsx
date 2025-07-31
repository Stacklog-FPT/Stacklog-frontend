import React from "react";
import "./MemberList.scss";
const MemberList = () => {
  // Get From Api
  const [classes, setClasses] = React.useState([
    { _id: "class-01", name: "SDN301c" },
    { _id: "class-02", name: "SWD301c" },
    { _id: "class-03", name: "MMA102c" },
    { _id: "class-04", name: "EXE101c" },
  ]);

  // Get From Api
  const [cities, setCities] = React.useState([
    { _id: 1, city: "HCM202" },
    { _id: 2, city: "DN202" },
    { _id: 3, city: "HN202" },
  ]);

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
            <h2>Member list</h2>
          </div>

          <div className="member__list__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="member__list__feature">
          <div className="member__list__feature__filter">
            <select>
              {classes.map((item) => {
                return <option key={item._id}>{item.name}</option>;
              })}
            </select>
            <select>
              {cities.map((item) => {
                return <option key={item._id}>{item.city}</option>;
              })}
            </select>
          </div>
          <div className="member__list__feature__date__of__public">
            <p>
              Date of publish: <span>14/4 - 1/5/2025</span>
            </p>
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
