import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to={"/login"} replace />;
  return <Outlet />;
};

export default ProtectedRoutes;
