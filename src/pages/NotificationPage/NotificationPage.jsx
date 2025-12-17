import React, { useEffect, useState } from 'react';
import './NotificationPage.scss';
import { RiLayoutHorizontalLine } from 'react-icons/ri';
import { FaStar, FaSearch, FaCalendar } from 'react-icons/fa';
import { FaBookmark } from 'react-icons/fa6';
import { FaTrashAlt } from 'react-icons/fa';
import NavBar from '../../components/NotificationComponents/NavBar/NavBar';
import TableList from '../../components/NotificationComponents/TableList/TableList';
import { useAuth } from '../../context/AuthProvider';
import { useDispatch } from 'react-redux';
import { getAllNotification } from '../../service/NotificationService';
const NotificationPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [active, setActive] = useState('Notification');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const features = [
    { id: 1, label: 'Notification', icon: <RiLayoutHorizontalLine /> },
    // { id: 2, label: 'Starred', icon: <FaStar /> },
    // { id: 3, label: 'Mark as read', icon: <FaBookmark /> },
    // { id: 4, label: 'Trash', icon: <FaTrashAlt /> },
  ];

  useEffect(() => {
    if (user && user.token) {
      getAllNotification(user.token, dispatch).catch(() => {});
    }
  }, [user, dispatch]);

  return (
    <div className="notification__page">
      <div className="notification__header">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <FaCalendar className="filter-icon" />
          <select 
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      <NavBar features={features} active={active} setActive={setActive} />
      <TableList feature={active} user={user} searchQuery={searchQuery} dateFilter={dateFilter} />
    </div>
  );
};

export default NotificationPage;
