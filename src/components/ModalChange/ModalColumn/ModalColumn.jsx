// ModalColumn.jsx
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaPen } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import './ModalColumn.scss';
import { deleteStatusApi } from '../../../service/ColumnService';
import { useAuth } from '../../../context/AuthProvider';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const GAP = 8;

const ModalColumn = ({ statusId, onEdit, onClose, anchor }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const statuses = useSelector((s) => s.status?.statuses || []);
  const selectedStatus = useMemo(
    () => statuses.find((it) => String(it.statusTaskId) === String(statusId)),
    [statuses, statusId],
  ); // Mì ăn liền

  const ref = useRef(null);
  const [pos, setPos] = useState(anchor);

  useLayoutEffect(() => {
    const adjust = () => {
      const el = ref.current;
      if (!el) return;

      const { innerWidth, innerHeight, scrollX, scrollY } = window;
      const rect = el.getBoundingClientRect();
      let newTop = anchor.top;
      let newLeft = anchor.left;

      if (rect.right > innerWidth) newLeft = Math.max(8, innerWidth - rect.width - 8 + scrollX);
      if (rect.bottom > innerHeight + scrollY)
        newTop = Math.max(8 + scrollY, anchor.top - rect.height - GAP);
      if (newTop < scrollY + 8) newTop = scrollY + 8;

      setPos({ top: newTop, left: newLeft });
    };

    adjust();
    const reflow = () => adjust();
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, { passive: true });
    return () => {
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow);
    };
  }, [anchor]);

  const handleEditClick = () => {
    onEdit?.();
    onClose?.();
  };

  const handleDelete = async () => {
    onClose?.();

    if (!selectedStatus?.id) {
      await Swal.fire({
        title: 'Cannot delete',
        text: 'Status not found or invalid id.',
        icon: 'error',
        confirmButtonColor: '#045745',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure to delete this status?',
      text: "This action can't be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#045745',
      cancelButtonColor: '#c8cad4',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      // Khuyến nghị: để deleteStatusApi throw error khi fail
      await deleteStatusApi(user.token, selectedStatus.id, dispatch);
      await Swal.fire('Deleted!', 'Status was removed successfully.', 'success');
    } catch (err) {
      await Swal.fire({
        title: 'Delete failed',
        text: err?.message || 'Something went wrong during deletion.',
        icon: 'error',
        confirmButtonColor: '#045745',
      });
    }
  };

  const handleBackdropClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  };

  return ReactDOM.createPortal(
    <>
      <div className="modal__column__backdrop" onMouseDown={handleBackdropClick} />
      <div ref={ref} className="modal__column" style={{ top: pos.top, left: pos.left }} role="menu">
        <div className="modal__column__container">
          <div className="modal__column__container__feature" onClick={handleEditClick}>
            <FaPen />
            <span>Edit</span>
          </div>
          <div className="modal__column__container__feature" onClick={handleDelete}>
            <FaRegTrashCan />
            <span>Delete</span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ModalColumn;
