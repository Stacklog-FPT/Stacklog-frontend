import React, { useState } from 'react';
import './TableList.scss';
import { useSelector } from 'react-redux';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { deleteNotificationApi } from '../../../service/NotificationService';
import { useDispatch } from 'react-redux';
const TableList = ({ active, user }) => {
  const notifications = useSelector((state) => state.notification.notifications);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(new Set());
  const itemPerPage = 5;
  const totalPage = Math.ceil(notifications.length / itemPerPage);
  const currentPage = useState(1);
  const startIndex = (currentPage - 1) * itemPerPage;
  const endIndex = startIndex + itemPerPage;
  const currentTimes = notifications.slice(startIndex, endIndex);

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

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table className="mail-table">
          <tbody>
            {notifications.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? 'is-selected' : ''}>
                <td className="cell-check">
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                    />
                    <span />
                  </label>
                </td>

                <td className="cell-star">
                  <button
                    className={`star ${r.starred ? 'active' : ''}`}
                    onClick={() => toggleStar(r.id)}
                    aria-label="toggle star"
                  />
                </td>

                <td className="cell-title">
                  <span className="title">{r.title}</span>
                </td>

                <td className="cell-time">{r.createdAt}</td>

                <td className="cell-more">
                  <button
                    className="more"
                    aria-label="more actions"
                    onClick={() => handleDelete(r.id)}
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div className="pagination">
        <button
          className="nav"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          &lsaquo;
        </button>

        <div className="pages">
          <button className="page ghost">…</button>
          {[page - 1, page, page + 1]
            .filter((n) => n >= 1 && n <= pageCount)
            .map((n) => (
              <button
                key={n}
                className={`page ${n === page ? 'active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          <button className="page ghost">…</button>
          <button className="page" onClick={() => setPage(pageCount)}>
            {pageCount}
          </button>
        </div>

        <button
          className="nav"
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={page === pageCount}
        >
          &rsaquo;
        </button>
      </div> */}
    </div>
  );
};

export default TableList;
