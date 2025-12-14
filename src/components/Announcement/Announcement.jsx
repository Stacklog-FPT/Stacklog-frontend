import { useState, useEffect, useRef, useContext } from 'react';
import './Announcement.scss';
import Card from './Card/Card';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAllNotification } from '../../service/NotificationService';
import { useAuth } from '../../context/AuthProvider';
import { AnnouncementContext } from '../../context/AnnoucementContext';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import decodeToken from '../../service/DecodeJwt';

const Announcement = () => {
  const { user } = useAuth();
  const { setIsAnnouncementVisible } = useContext(AnnouncementContext) || {};
  const announcementRef = useRef(null);
  const decodeId = decodeToken(user.token)?.id;
  const { notifications } = useSelector((state) => state.notification);
  // notifications are in backend shape: { _id, content, type, receivers: [{ userId, isRead, _id }], createdAt }
  const notificationList = (notifications || []).filter((nt) =>
    Array.isArray(nt.receivers) ? nt.receivers.some((r) => r.userId === decodeId) : false,
  );
  const sortedAnnouncements = [...notificationList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const navigate = useNavigate();
  const handleNotificationClick = (item) => {
    if (!item || !item.path) return;
    
    // Close announcement after clicking
    if (setIsAnnouncementVisible) {
      setIsAnnouncementVisible(false);
    }
    
    // treat internal routes (starting with '/') as SPA routes
    if (item.path.startsWith('/')) {
      navigate(item.path);
    } else {
      // external link - open in new tab
      window.open(item.path, '_blank');
    }
  };

  // For UI we show only notifications relevant to current user; unread tab filters those not read by current user
  const filteredAnnouncements =
    activeTab === 'unread'
      ? notificationList.filter((item) => {
          const me = (item.receivers || []).find((r) => r.userId === decodeId);
          return me ? !me.isRead : false;
        })
      : notificationList;

  useEffect(() => {
    getAllNotification(user.token, dispatch);
  }, []);

  // Close announcement when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (announcementRef.current && !announcementRef.current.contains(event.target)) {
        if (setIsAnnouncementVisible) {
          setIsAnnouncementVisible(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsAnnouncementVisible]);

  return (
    <div className="announcement-container" ref={announcementRef}>
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
          {
            // decide which list to render
            (() => {
              const listToRender = activeTab === 'all' ? sortedAnnouncements : filteredAnnouncements;
              if (!listToRender || listToRender.length === 0) {
                return (
                  <div className="main-announcement-list-empty">
                    <p className="main-announcement-list-empty-text">No announcement now!</p>
                  </div>
                );
              }
              console.log("listToRender", listToRender)

              return listToRender.map((item) => {
                const me = (item.receivers || []).find((r) => r.userId === decodeId) || {};
                const isRead = !!me.isRead;
                const author = item.author || { name: 'System', avatar: '' };
                return (
                  <Card
                    key={item._id}
                    avatar={author.avatar}
                    title={item.content || item.title}
                    isRead={isRead}
                    createdAt={item.createdAt}
                    name={author.name}
                    onClick={() => handleNotificationClick(item)}
                  />
                );
              });
            })()
          }
        </div>
        <NavLink to={'/notification'} className="btn-see-all">
          See All Announcements
        </NavLink>
      </div>
    </div>
  );
};

export default Announcement;
