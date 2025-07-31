import React from "react";
import "./Detailstudent.scss";
const Detailstudent = ({ handleActiveDetailStudent }) => {
  const [student] = React.useState({
    _id: 1,
    name: "Olivia Ryhe",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s",
    email: "oliviaryhe@gmail.com",
    classCode: ["DE170123", "SDN302c", "SWD202", "PMG201c"],
    subjectCode: ["HCM202"],
  });

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleActiveDetailStudent();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleActiveDetailStudent]);

  return (
    <div className="detail__student">
      <div className="detail__student__popup">
        <i
          className="fa-solid fa-xmark detail__student__close"
          onClick={handleActiveDetailStudent}
          title="Close"
        ></i>
        <div className="detail__student__avatar">
          <img src={student.avatar} alt="avatar" />
        </div>
        <h3 className="detail__student__name">{student.name}</h3>
        <p className="detail__student__id">ID: {student._id}</p>
        <p className="detail__student__email">{student.email}</p>
        <div className="detail__student__codes">
          <div className="detail__student__codes__block">
            <h4>Class Codes</h4>
            <ul>
              {student.classCode.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="detail__student__codes__block">
            <h4>Subject Codes</h4>
            <ul>
              {student.subjectCode.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detailstudent;
