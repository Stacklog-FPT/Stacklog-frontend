import React from "react";
import "./AdminDashBoard.scss";
import ListLecture from "../../components/AdminComponents/ListLecture/ListLecture";
import NavbarList from "../../components/AdminComponents/NavbarList/NavbarList";
const AdminDashBoard = () => {
  return (
    <div className="admin__dashboard">
      <NavbarList />
      <ListLecture />
    </div>
  );
};

export default AdminDashBoard;
