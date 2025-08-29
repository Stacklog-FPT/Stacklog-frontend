import React, { useState } from 'react';
import './NotificationPage.scss';
import { RiLayoutHorizontalLine } from 'react-icons/ri';
import { FaStar } from 'react-icons/fa';
import { FaBookmark } from 'react-icons/fa6';
import { FaTrashAlt } from 'react-icons/fa';
import NavBar from '../../components/NotificationComponents/NavBar/NavBar';
import TableList from '../../components/NotificationComponents/TableList/TableList';
import { useAuth } from '../../context/AuthProvider';
const NotificationPage = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('All');
  const features = [
    { id: 1, label: 'All', icon: <RiLayoutHorizontalLine /> },
    { id: 2, label: 'Starred', icon: <FaStar /> },
    { id: 3, label: 'Mark as read', icon: <FaBookmark /> },
    { id: 4, label: 'Trash', icon: <FaTrashAlt /> },
  ];

  return (
    <div className="notification__page">
      <NavBar features={features} active={active} setActive={setActive} />
      <TableList feature={active} user={user} />
    </div>
  );
};

export default NotificationPage;
