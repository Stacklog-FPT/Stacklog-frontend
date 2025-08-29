import { useState, useEffect } from 'react';
import './Announcement.scss';
import Card from './Card/Card';
import { NavLink } from 'react-router';
import { getAllNotification } from '../../service/NotificationService';
import { useAuth } from '../../context/AuthProvider';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import decodeToken from '../../service/DecodeJwt';

const Announcement = () => {
  const { user } = useAuth();
  const decodeId = decodeToken(user.token).id;
  const { notifications } = useSelector((state) => state.notification);
  const notificationList = notifications.filter((nt) => nt.assignTo.includes(decodeId));
  const sortedAnnouncements = [...notificationList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredAnnouncements =
    activeTab === 'unread' ? notificationList.filter((item) => !item.isRead) : notifications;

  useEffect(() => {
    getAllNotification(user.token, dispatch);
  }, []);
  return (
    <div className="announcement-container">
      <div className="main-announcement">
        <div className="main-announcement-header">
          <h1>Announcement</h1>
          <i className="fa-solid fa-bars"></i>
        </div>
        <div className="main-announcement-categories">
          <p className={activeTab === 'all' ? 'active' : ''} onClick={() => handleTabClick('all')}>
            All
          </p>
          <p
            className={activeTab === 'unread' ? 'active' : ''}
            onClick={() => handleTabClick('unread')}
          >
            Unread Messages
          </p>
        </div>
        <div className="main-announcement-list">
          {activeTab === 'all' ? (
            sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((item) => (
                <Card
                  key={item._id}
                  avatar={item.author.avatar}
                  title={item.title}
                  isRead={item.isRead}
                  createdAt={item.createdAt}
                  name={item.author.name}
                />
              ))
            ) : (
              <div className="main-announcement-list-empty">
                <p className="main-announcement-list-empty-text">No announcement now!</p>
              </div>
            )
          ) : filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((item) => (
              <Card
                key={item._id}
                avatar={item.author.avatar}
                title={item.title}
                isRead={item.isRead}
                createdAt={item.createdAt}
                name={item.author.name}
              />
            ))
          ) : (
            <div className="main-announcement-list-empty">
              <p className="main-announcement-list-empty-text">No announcement now!</p>
            </div>
          )}
        </div>
        <NavLink to={'/notification'} className="btn-see-all">
          See All Announcements
        </NavLink>
      </div>
    </div>
  );
};

export default Announcement;
