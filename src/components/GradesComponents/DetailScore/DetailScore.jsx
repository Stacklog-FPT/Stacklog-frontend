import React from "react";
import "./DetailScore.scss";
const DetailScore = ({ handleActiveDetail }) => {
  const [student] = React.useState({
    _id: 1,
    name: "Olivia Ryhe",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    email: "oliviaryhe@gmail.com",
    classCode: ["DE170123", "SDN302c", "SWD202", "PMG201c"],
    subjectCode: ["HCM202"],
    total: 9,
    status: true,
    grades: [
      { _id: 1, name: "Check point 1", weight: 10, value: 9.5 },
      { _id: 2, name: "Check point 2", weight: 20, value: 9.5 },
      { _id: 3, name: "Check point 3", weight: 30, value: 8.3 },
      { _id: 4, name: "Final project", weight: 40, value: 9.3 },
    ],
  });

  React.useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        handleActiveDetail();
      }
    });
  }, []);

  return (
    <div className="detail__score">
      <div className="detail__score__container">
        <div className="detail__score__container__left">
          <div className="detail__score__container__left__infor">
            <img src={student.avatar} alt="this is the avatar" />
            <h3>{student.name}</h3>
            <p>{student.email}</p>
          </div>
          <div className="detail__score__container__left__infor__class__code">
            <h4>Class Code</h4>
            <ul>
              {student.classCode.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="detail__score__container__left__infor__subject__code">
            <h4>Subject Code</h4>
            <ul>
              {student.subjectCode.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="detail__score__container__right">
          <div className="detail__score__container__right__heading">
            <h2>Report Score</h2>
            <i className="fa-solid fa-xmark" onClick={handleActiveDetail}></i>
          </div>
          <div className="detail__score__container__right__total__status">
            <div className="detail__score__container__right__total__status__total">
              <h4>Total</h4>
              <span className={student.status ? "isPassed" : "notPassed"}>
                {student.total}
              </span>
            </div>
            <div className="detail__score__container__right__total__status__status">
              <h4>Average</h4>
              <span className={student.status ? "isPassed" : "notPassed"}>
                {student.status ? "Passed" : "Not passed"}
              </span>
            </div>
          </div>
          <div className="detail__score__container__right__table__list">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Item (optional)</th>
                  <th>Weight (%)</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {student.grades.map((item) => (
                  <tr key={item._id}>
                    <td style={{ textAlign: "left" }}>{item.name}</td>
                    <td>{item.weight}</td>
                    <td>{item.value}</td>
                    <td>
                      <i className="fa-solid fa-info"></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailScore;
