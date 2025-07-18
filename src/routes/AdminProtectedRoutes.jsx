import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const AdminProtectedRoutes = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to={"/login"} replace />;

  if (user?.role !== "ADMIN") return <Navigate to={"/404"} replace />;
  return <Outlet />;
};

export default AdminProtectedRoutes;
