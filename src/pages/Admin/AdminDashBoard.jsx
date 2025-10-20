import React from "react";
import "./AdminDashBoard.scss";
import ListLecture from "../../components/AdminComponents/ListLecture/ListLecture";
import ListStudent from "../../components/AdminComponents/ListStudent/ListStudent";
import ListSemester from "../../components/AdminComponents/AdminSemester/ListSemester";
import ListClass from "../../components/AdminComponents/AdminClass/ListClass";
import { useSearchParams } from "react-router-dom";

const AdminDashBoard = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "Lecture";
  return (
    <div className="admin__dashboard">
      {role === "Lecture" && <ListLecture />}
      {role === "Student" && <ListStudent />}
      {role === "Semester" && <ListSemester />}
      {role === "Class" && <ListClass />} 
    </div>
  );
};

export default AdminDashBoard;
