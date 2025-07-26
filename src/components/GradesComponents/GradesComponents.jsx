import React from "react";
import "./GradesComponents.scss";
const GradesComponents = ({ handleActiveDetail, handleActivityAddCore}) => {
  const [classes, setClasses] = React.useState([
    { _id: 1, name: "SDN302c" },
    { _id: 2, name: "PMG201c" },
    { _id: 3, name: "EXE101" },
    { _id: 4, name: "SWD301c" },
  ]);

  const [area, setArea] = React.useState([
    { _id: 1, name: "HCM202" },
    { _id: 2, name: "DN202" },
    { _id: 3, name: "HN202" },
  ]);

  const [students, setStudents] = React.useState([
    {
      _id: 1,
      name: "Oliva Rhye",
      email: "olivaryhe@gmail.com",
      id: "DE17023",
      status: true,
      average: 9.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 2,
      name: "Otis",
      email: "otis@gmail.com",
      id: "DE17025",
      status: true,
      average: 7.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 3,
      name: "Phoenix Banker",
      email: "phoenixbanker@gmail.com",
      id: "DE17028",
      status: true,
      average: 8.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 4,
      name: "Candice Wu",
      email: "candiewu@gmail.com",
      id: "DE17030",
      status: false,
      average: 4.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 5,
      name: "Candice Wu",
      email: "candiewu@gmail.com",
      id: "DE17031",
      status: true,
      average: 7.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 6,
      name: "Candice Wu",
      email: "candiewu@gmail.com",
      id: "DE17031",
      status: true,
      average: 7.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
    {
      _id: 7,
      name: "Natali Crag",
      email: "natalicrag@gmail.com",
      id: "DE17035",
      status: true,
      average: 9.0,
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    },
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = students.slice(startIndex, endIndex);

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
            <button onClick={handleActivityAddCore}>
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
                <th>Status</th>
                <th>Average</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>
                      <p style={{ paddingTop: "15px" }}>{index + 1}</p>
                    </td>
                    <td>
                      <div className="name__ava">
                        <img src={item.avatar} />
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
                      {item.status ? (
                        <span className="passed__text">Passed</span>
                      ) : (
                        <span className="not__passed__text">Not Passed</span>
                      )}
                    </td>
                    <td>
                      <p
                        style={{ paddingLeft: "15px" }}
                        className={item.status ? "isPassed" : "notPassed"}
                      >
                        {item.average}
                      </p>
                    </td>
                    <td>
                      <span
                        className="btn__see__detail"
                        onClick={handleActiveDetail}
                      >
                        Detail
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <h2>Oops! </h2>
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

export default GradesComponents;
