import React from "react";
import "./DetailStudent.scss";
const Detailstudent = ({ student, handleActiveDetailStudent }) => {
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleActiveDetailStudent();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleActiveDetailStudent]);

  if (!student) return null;

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
        <p className="detail__student__id">ID: {student.id || student._id}</p>
        <p className="detail__student__email">{student.email}</p>
        <div className="detail__student__codes">
          <div className="detail__student__codes__block">
            <h4>Class Name</h4>
            <ul>
              {(student.classNames || []).map((name, idx) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detailstudent;
