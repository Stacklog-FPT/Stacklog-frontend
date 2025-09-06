import React, { useState } from "react";
import "./ClassList.scss";
import { IoFilter } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import ClassService from "../../../../service/ClassService";
import { useAuth } from "../../../../context/AuthProvider";
import axios from "axios";
import FormAddStudent from "./FormAddStudent/FormAddStudent";
const ClassList = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = React.useState("");
  const [classList, setClassList] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const membersPerPage = 5;
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);
  const [isBan, setIsBan] = useState(true)
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // const { getMembersInClass } = ClassService();

  // const handleGetMembersInClass = async () => {
  //   try {
  //     const response = await getMembersInClass(user?.token);
  //     if (response) {
  //       console.log(response);
  //       setData(response.data);
  //     }
  //   } catch (e) {
  //     console.error(e.message);
  //   }
  // };

  // const getClasses = data.map((item) => {
  //   setClassList(item.classesName);
  //   console.log(item.classesName);
  // });

  const handleGetClass = async () => {
    try {
      const response = await axios.get("http://localhost:3000/classes");
      if (response && response.data.length > 0) {
        const subjectList = response.data[0].subjects;
        setClassList(subjectList);
        setSelectedClass(subjectList[0].name);
        setMembers(subjectList[0].members);
      }
    } catch (e) {
      console.error(e.message || "Something went wrong!");
    }
  };

  const handleGetMembers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/classes");

      if (
        response &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const subjects = response.data[0].subjects;
        const allMembers = subjects.flatMap((subject) =>
          Array.isArray(subject.members) ? subject.members : []
        );

        setMembers(allMembers);
      }
    } catch (e) {
      console.error(e.message || "Something went wrong!");
    }
  };

  const handleChangeClass = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    const selected = classList.find((subject) => subject.name === className);
    setMembers(selected?.members || []);
  };

  const handleDeleteStudent = async (memberId) => {
    try {
     
      const res = await axios.get("http://localhost:3000/classes");
      const currentClass = res.data[0];

      // Tìm subject theo selectedClass
      const updatedSubjects = currentClass.subjects.map((subject) => {
        if (subject.name === selectedClass) {
          // Lọc ra những member không bị xóa
          const updatedMembers = subject.members.filter(
            (member) => member.id !== memberId
          );
          return { ...subject, members: updatedMembers };
        }
        return subject;
      });
      const updatedClass = { ...currentClass, subjects: updatedSubjects };

      await axios.put(
        `http://localhost:3000/classes/${currentClass.id}`,
        updatedClass
      );

      const updatedMemberList = members.filter(
        (member) => member.id !== memberId
      );
      setMembers(updatedMemberList);
    } catch (e) {
      console.error("Failed to delete member:", e.message);
    }
  };

  React.useEffect(() => {
    // handleGetMembersInClass();
    handleGetClass();
    handleGetMembers();
  }, []);

  React.useEffect(() => {
    console.log("showForm state:", showForm);
  }, [showForm]);
  return (
    <div className="class__list">
      <div className="class__list__container">
        <div className="class__list__container__heading">
          <div className="class__list__container__heading__select">
            <select onChange={handleChangeClass} value={selectedClass}>
              {classList.map((item, index) => (
                <option value={item.name} key={index}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="class__list__container__heading__feature">
            <IoFilter className="icon" />
            <FaPlus
              className="icon"
              onClick={() => {
                console.log("Opening form");
                setShowForm(true);
              }}
            />
            <FaTrash className="icon" />
          </div>
        </div>

        <div className="class__list__container__body">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={item.avatar}
                      alt={item.name}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                    {item.name}
                  </td>
                  <td>{item.id}</td>
                  <td>{item.email}</td>
                  <td>
                    <FaTrash
                      className="icon"
                      onClick={() => handleDeleteStudent(item.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowForm(false)}>
              &times;
            </span>
            <FormAddStudent
              subjectList={classList}
              selectedSubject={selectedClass}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
