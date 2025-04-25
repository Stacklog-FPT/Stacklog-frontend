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

const routes = [
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/class",
        element: <ClassPage />,
      },
      {
        path: "/tasks",
        element: <TaskPage />,
      },
      {
        path: "/schedule",
        element: <SchedulePage />,
      },
      {
        path: "/documents",
        element: <DocumentPage />,
      },
      {
        path: "/chatbox",
        element: <ChatPage />,
      },
      {
        path: "/grades",
        element: <GradesPage />,
      },
      {
        path: "/chatbox",
        element: <ChatPage />,
      },
      {
        path: "/plan",
        element: <PlanPage />,
      },
      {
        path: "/user-detail",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
];

const Routes = () => {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
};

export default Routes;
