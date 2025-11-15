import React from "react";
import "./AdminDashBoard.scss";
import ListAdminManager from "../../components/AdminComponents/List/ListAdminManager";
import { useSearchParams } from "react-router-dom";

const AdminDashBoard = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "Semester";
  return (
    <div className="admin__dashboard">
      <ListAdminManager role={role} />
    </div>
  );
};

export default AdminDashBoard;
