import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './TaskDetail.scss';
import { useDispatch, useSelector } from 'react-redux';
import CommentBody from '../../Task/CommentTask/CommentBody';
import CommentFooter from '../../Task/CommentTask/CommentFooter';
import { formatDateUI } from '../../../helper/formatDate';
import { useAuth } from '../../../context/AuthProvider';
import axios from 'axios';
import { createReview } from '../../../service/ReviewService';
import ReviewService from '../../../service/ReviewService';
import decodeToken from '../../../service/DecodeJwt';
import { FaChevronRight } from 'react-icons/fa';
import Navbar from './Navbar/Navbar';
import Checklist from './Checklist/Checklist';
import SubTask from './SubTask/SubTask';

const TaskDetails = ({ task, onClose }) => {
  const statuses = useSelector((state) => state.status.statuses);
  const currentStatus = statuses.find((s) => String(s.statusTaskId) === String(task.statusTaskId));
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [userMap] = useState({});
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const panelRef = useRef(null);
  const { user } = useAuth();
  const decoded = decodeToken(user.token);
  const dispatch = useDispatch();
  const { deleteReview } = ReviewService();
  const [activeTab, setActiveTab] = useState('subtasks');
  const toggleComments = () => setIsCommentsOpen((v) => !v);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = {
        ...task,
        reviews: [
          ...(task.reviews || []),
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
      const res = await createReview(user?.token, task.id, payload, dispatch);
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

  const handleEditComment = (item) => {
    setEditingCommentId(item.reviewId);
    setEditedComment(item.reviewContent);
  };

  const handleUpdateComment = async () => {
    if (!editedComment.trim()) return;
    try {
      const reviews = task?.reviews || [];
      const payload = {
        ...task,
        reviews: reviews.map((r) =>
          r.reviewId === editingCommentId ? { ...r, reviewContent: editedComment } : r,
        ),
      };
      const res = await createReview(user?.token, task.id, payload, dispatch);
      if (res) {
        setEditingCommentId(null);
        setEditedComment('');
      }
    } catch (e) {
      console.error('Update failed:', e.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteReview(user.token, commentId);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = prev);
  }, []);

  const handleBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  return ReactDOM.createPortal(
    <div className="taskdetail__root">
      <div className="taskdetail__backdrop" onMouseDown={handleBackdropClick} />
      <aside ref={panelRef} className="taskdetail__panel" role="dialog" aria-modal="true">
        {/* Title Task */}
        <header className="taskdetail__header">
          <div className="taskdetail__title">
            <span className="taskdetail__pill">{task?.priority || 'NORMAL'}</span>
            <h2 title={task?.taskTitle}>{task?.taskTitle || 'Untitled task'}</h2>
          </div>
          <button className="taskdetail__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <section className="taskdetail__meta">
          <div>
            <label>Status</label>
            <p>{currentStatus?.statusTaskName ?? '-'}</p>
          </div>
          <div>
            <label>Start</label>
            <p>{formatDateUI(task?.taskStartTime)}</p>
          </div>
          <div>
            <label>Due</label>
            <p>{formatDateUI(task?.taskDueDate)}</p>
          </div>
        </section>
        {/* Description Task */}

        <section className="taskdetail__desc">
          <label>Description</label>
          <div className="taskdetail__descbox">
            {task?.taskDescription || <i>No description</i>}
          </div>
        </section>

        {/* AssignTo Task */}
        <section className="taskdetail__section">
          <label>Assignees</label>
          <div className="taskdetail__chips">
            {(task?.assignTo || []).map((u) => (
              <span key={u} className="chip">
                @{u}
              </span>
            ))}
          </div>
        </section>

        {/* Navbar */}
        <Navbar
          active={activeTab}
          onChange={setActiveTab}
          counts={{
            subtasks: task?.subTasks?.length || 0,
            checklists: (task?.checkList || []).length || 0,
          }}
        />

        <section className="taskdetail__todo">
          {activeTab === 'subtasks' ? (
            <SubTask data={task?.subTasks} />
          ) : (
            <Checklist data={task?.checkList} />
          )}
        </section>
        {/* Comment Task */}
        <section className="taskdetail_comments">
          <button
            className="comments__toggle"
            onClick={toggleComments}
            aria-expanded={isCommentsOpen}
            aria-controls="comments-panel"
          >
            <FaChevronRight
              className={`comments__chevron ${isCommentsOpen ? 'is-open' : ''}`}
              size={14}
            />
            <span>Comments</span>
            <span className="comments__count">{task?.reviews?.length || 0}</span>
          </button>
          <div
            id="comments-panel"
            className={`comments__content ${isCommentsOpen ? 'open' : ''}`}
            aria-hidden={!isCommentsOpen}
          >
            <div className="comments__inner">
              <CommentBody
                reviews={task?.reviews}
                userMap={{}}
                formatDate={(d) => formatDateUI(d)}
                decodedId={decoded?.id}
                editingCommentId={editingCommentId}
                editedComment={editedComment}
                onEdit={handleEditComment}
                onChangeEdited={setEditedComment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
              <CommentFooter
                avatar={
                  user?.avatar ||
                  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                }
                newComment={newComment}
                onChangeNew={setNewComment}
                onSend={handleSendComment}
              />
            </div>
          </div>
        </section>
      </aside>
    </div>,
    document.body,
  );
};

export default TaskDetails;
