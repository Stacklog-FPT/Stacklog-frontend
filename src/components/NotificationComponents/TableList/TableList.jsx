import React, { useState, useMemo, useEffect } from 'react';
import './TableList.scss';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaInbox } from 'react-icons/fa';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { deleteNotificationApi } from '../../../service/NotificationService';
import { useDispatch } from 'react-redux';
const TableList = ({ active, user, searchQuery, dateFilter }) => {
  const notifications = useSelector((state) => state.notification.notifications || []);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to check if date matches filter
  const matchesDateFilter = (dateString, filter) => {
    if (!dateString || filter === 'all') return true;
    
    try {
      const notifDate = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch(filter) {
        case 'today':
          return notifDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return notifDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return notifDate >= monthAgo;
        default:
          return true;
      }
    } catch (e) {
      return true;
    }
  };

  // Filter notifications based on search query and date
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    console.log('[TableList] Total notifications:', notifications.length);
    console.log('[TableList] Search query:', searchQuery);
    console.log('[TableList] Date filter:', dateFilter);
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((notif) => 
        notif.title?.toLowerCase().includes(query) ||
        notif.createdAt?.toLowerCase().includes(query)
      );
      console.log('[TableList] After search filter:', filtered.length);
    }
    
    // Apply date filter
    if (dateFilter && dateFilter !== 'all') {
      filtered = filtered.filter((notif) => 
        matchesDateFilter(notif.createdAt, dateFilter)
      );
      console.log('[TableList] After date filter:', filtered.length);
    }
    
    console.log('[TableList] Final filtered:', filtered.length);
    return filtered;
  }, [notifications, searchQuery, dateFilter]);

  const itemPerPage = 10;
  const totalPage = Math.max(1, Math.ceil(filteredNotifications.length / itemPerPage));
  const startIndex = (currentPage - 1) * itemPerPage;
  const endIndex = startIndex + itemPerPage;
  const currentTimes = filteredNotifications.slice(startIndex, endIndex);
  
  console.log('[TableList] Current page:', currentPage, 'Total pages:', totalPage, 'Showing:', currentTimes.length);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure to delete this task?',
      text: "This action can't completed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#045745',
      cancelButtonColor: '#c8cad4',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const response = await deleteNotificationApi(user.token, id, dispatch);

      if (response.status === 200) {
        Swal.fire('Deleted!', '', 'success');
      } else {
        Swal.fire('Something went wrong!', '', 'error');
      }
    }
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const toggleStar = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n));
    dispatch({ type: 'notification/getNotifications', payload: updated });
  };

  const navigate = useNavigate();
  const handleRowClick = (r) => {
    if (!r || !r.path) return;
    if (r.path.startsWith('/')) navigate(r.path);
    else window.open(r.path, '_blank');
  };

  return (
    <div className="table-wrap">
      {searchQuery && (
        <div className="search-results-info">
          <span className="results-count">
            {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
      <div className="table-scroll">
        <table className="mail-table">
          <tbody>
            {currentTimes.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5" className="empty-state">
                  <FaInbox className="empty-icon" />
                  <p className="empty-text">
                    {searchQuery ? 'No notifications match your search' : 'No notifications yet'}
                  </p>
                </td>
              </tr>
            ) : (
              currentTimes.map((r) => (
              <tr
                key={r.id}
                className={selected.has(r.id) ? 'is-selected' : ''}
                onClick={() => handleRowClick(r)}
                style={{ cursor: r.path ? 'pointer' : undefined }}
              >
                <td className="cell-check">
                  {/* <label className="chk">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRow(r.id);
                      }}
                    />
                    <span />
                  </label> */}
                </td>

                <td className="cell-star">
                  {/* <button
                    className={`star ${r.starred ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(r.id);
                    }}
                    aria-label="toggle star"
                  /> */}
                </td>

                <td className="cell-title">
                  <span className="title">{r.title}</span>
                </td>

                <td className="cell-time">{r.createdAt}</td>

                {/* <td className="cell-more">
                  <button
                    className="more"
                    aria-label="more actions"
                    onClick={() => handleDelete(r.id)}
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </td> */}
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {filteredNotifications.length > 0 && (
        <div className="pagination">
          <button
            className="pagination__button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="pagination__info">
            Page {currentPage} of {totalPage} ({filteredNotifications.length} total)
          </span>
          <button
            className="pagination__button"
            onClick={() => setCurrentPage((p) => Math.min(totalPage, p + 1))}
            disabled={currentPage === totalPage}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default TableList;
