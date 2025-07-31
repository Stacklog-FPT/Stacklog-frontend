import React from "react";
import Home from "../pages/HomePage/Home";
import LoginPage from "../pages/LoginPage/LoginPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import TaskPage from "../pages/TaskPage/TaskPage";
import ClassPage from "../pages/ClassPage/ClassPage";
import SchedulePage from "../pages/SchedulePage/SchedulePage";
import DocumentPage from "../pages/DocumentPage/DocumentPage";
import ChatPage from "../pages/ChatPage/ChatPage";
import GradesPage from "../pages/GradesPage/GradesPage";
import PlanPage from "../pages/PlanPage/PlanPage";
import Profile from "../pages/Profile/Profile";
import MainLayoutWithProvider from "../layouts/MainLayout";
import { AuthProvider } from "../context/AuthProvider";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFoundPage from "../pages/404page/NotFoundPage";
import AdminProtectedRoutes from "./AdminProtectedRoutes";
import AdminDashBoard from "../pages/Admin/AdminDashBoard";
import MorePage from "../pages/MorePage/MorePage";
import LayoutAdmin from "../layouts/LayoutAdmin/LayoutAdmin";

const routes = [
  {
    element: (
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/class", element: <ClassPage /> },
          { path: "/tasks", element: <TaskPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/documents", element: <DocumentPage /> },
          { path: "/chatbox", element: <ChatPage /> },
          { path: "/grades", element: <GradesPage /> },
          { path: "/plan", element: <PlanPage /> },
          { path: "/user-detail", element: <Profile /> },
          { path: "/more", element: <MorePage /> },
        ],
      },
    ],
  },
  {
    element: (
      <AuthProvider>
        <AdminProtectedRoutes />
      </AuthProvider>
    ),
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { path: "/admin", element: <AdminDashBoard /> },
          { path: "/user-detail", element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },

  {
    path: "/404",
    element: <NotFoundPage />,
  },
];
const Routes = () => {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
};

export default Routes;
