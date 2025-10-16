import React from 'react';
import Home from '../pages/HomePage/Home';
import LoginPage from '../pages/LoginPage/LoginPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import TaskPage from '../pages/TaskPage/TaskPage';
import ClassPage from '../pages/ClassPage/ClassPage';
import SchedulePage from '../pages/SchedulePage/SchedulePage';
import DocumentPage from '../pages/DocumentPage/DocumentPage';
import ChatPage from '../pages/ChatPage/ChatPage';
import Meeting from '../pages/Meeting/Meeting';
import GradesPage from '../pages/GradesPage/GradesPage';
import PlanPage from '../pages/PlanPage/PlanPage';
import Profile from '../pages/Profile/Profile';
import { AuthProvider } from '../context/AuthProvider';
import ProtectedRoutes from './ProtectedRoutes';
import NotFoundPage from '../pages/404page/NotFoundPage';
import AdminProtectedRoutes from './AdminProtectedRoutes';
import AdminDashBoard from '../pages/Admin/AdminDashBoard';
import MorePage from '../pages/MorePage/MorePage';
import LayoutAdmin from '../layouts/LayoutAdmin/LayoutAdmin';
import JoinClass from '../pages/JoinClass/JoinClass';
import TaskSelfPage from '../pages/TaskSelfPage/TaskSelfPage';
import NotificationPage from '../pages/NotificationPage/NotificationPage';

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
          { path: '/', element: <Home /> },
          { path: '/tasks-self/', element: <TaskSelfPage /> },
          { path: '/tasks/:groupId', element: <ClassPage /> }, // Task
          { path: '/class', element: <TaskPage /> }, // Class
          { path: '/schedule', element: <SchedulePage /> },
          { path: '/documents', element: <DocumentPage /> },
          { path: '/chatbox', element: <ChatPage /> },
          { path: '/chatbox/:boxId', element: <ChatPage /> },
          { path: '/meeting', element: <Meeting /> },
          { path: '/grades', element: <GradesPage /> },
          { path: '/plan', element: <PlanPage /> },
          { path: '/user-detail', element: <Profile /> },
          { path: '/more', element: <MorePage /> },
          { path: '/notification', element: <NotificationPage /> },
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
          { path: '/admin', element: <AdminDashBoard /> },
          { path: '/user-detail', element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: '/join-class/:inviteCode',
    element: (
      <AuthProvider>
        <JoinClass />
      </AuthProvider>
    ),
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
];
const Routes = () => {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
};

export default Routes;
