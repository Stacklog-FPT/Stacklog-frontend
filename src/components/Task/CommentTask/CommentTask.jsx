import { useState, useEffect, useRef } from 'react';
import './CommentTask.scss';
import ReviewService from '../../../service/ReviewService';
import { useAuth } from '../../../context/AuthProvider';
import { BsFillSendFill } from 'react-icons/bs';
import decodeToken from '../../../service/DecodeJwt';
import Swal from 'sweetalert2';
import axios from 'axios';
import { createReview } from '../../../service/ReviewService';
import { useDispatch, useSelector } from 'react-redux';
import CommentTaskBody from './CommentBody';
import CommentTaskFooter from './CommentFooter';
import { useParams } from 'react-router';
import { updateTaskApi, updateReviewApi } from '../../../service/TaskService';


const CommentTask = ({ task, isClose }) => {
  console.log(task);
  const tasks = useSelector((t) => t.task.tasks);
  const currentTask = tasks.find((t) => t.id === task.id); // Change taskId before mockup with BE
  const reviews = currentTask?.reviews || [];

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const { user } = useAuth();
  const decoded = decodeToken(user.token);
  const decodedId = decoded?.id;
  const { deleteReview } = ReviewService();
  const dispatch = useDispatch();

  //
  const wrapperRef = useRef(null);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = {
        ...currentTask,
        reviews: [
          ...(reviews || []),
          {
            reviewId: Math.random(),
            reviewContent: newComment,
            taskId: task.taskId ?? task.id,
            createdBy: user._id,
            createdAt: new Date().toISOString(),
            avatar_link:
              user.avatar ||
              'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
          },
        ],
      };

      const res = await updateTaskApi(payload, user?.token, dispatch);
      if (res) {
        setNewComment('');
        await axios.post('http://localhost:3000/notifications', {
          id: Math.random().toString(16).slice(2, 6),
          title: `Comment by ${user.username}`,
          author: {
            _id: Math.random(),
            name: user.username || 'Unknown',
            avatar:
              user.avatar ||
              'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
          },
          createdAt: new Date().toISOString().split('T')[0],
          isRead: false,
          _id: Math.random(),
        });
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: 'Are you sure to delete this comment?',
      text: "This action can't be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#045745',
      cancelButtonColor: '#c8cad4',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await deleteReview(user.token, commentId);
        // tuỳ backend có trả list mới hay không, bạn có thể dispatch refetch ở đây nếu cần
      } catch (e) {
        console.error(e.message);
      }
    }
  };

  const handleEditComment = (item) => {
    setEditingCommentId(item.reviewId);
    setEditedComment(item.reviewContent);
  };

  const handleUpdateComment = async () => {
    if (!editedComment.trim()) return;
    try {
      const payload = {
        ...currentTask,
        reviews: [
          {
            reviewId: editingCommentId,
            reviewContent: editedComment,
            createdBy: decodedId,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const res = await updateReviewApi(
        user?.token,
        currentTask.taskId,
        editingCommentId,
        payload,
        dispatch,
      );
      if (res.status === 200) {
        setEditingCommentId(null);
        setEditedComment('');
      }
    } catch (e) {
      console.error('Update failed:', e.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        isClose();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        isClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isClose]);

  return (
    <div className="comment__task__container" ref={wrapperRef}>
      <div className="comment__task__header">
        <h2>Comment</h2>
        <i className="fa-solid fa-xmark close-icon" onClick={isClose}></i>
      </div>

      <CommentTaskBody
        reviews={reviews}
        decodedId={decodedId}
        editingCommentId={editingCommentId}
        editedComment={editedComment}
        onEdit={handleEditComment}
        onChangeEdited={setEditedComment}
        onUpdate={handleUpdateComment}
        onDelete={handleDeleteComment}
      />

      <CommentTaskFooter
        avatar={
          user.avatar ||
          'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
        }
        newComment={newComment}
        onChangeNew={setNewComment}
        onSend={handleSendComment}
      />
    </div>
  );
};

export default CommentTask;
