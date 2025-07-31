import React from "react";
import "./AdminDashBoard.scss";
import ListLecture from "../../components/AdminComponents/ListLecture/ListLecture";
import NavbarList from "../../components/AdminComponents/NavbarList/NavbarList";
import ListStudent from "../../components/AdminComponents/ListStudent/ListStudent";
const AdminDashBoard = () => {
  const [listByRole, setListByRole] = React.useState("Lecture");
  return (
    <div className="admin__dashboard">
      <NavbarList listByRole={listByRole} setListByRole={setListByRole} />
      {listByRole === "Lecture" && <ListLecture  />}
      {listByRole === "Student" && <ListStudent />}
    </div>
  );
};

export default AdminDashBoard;
