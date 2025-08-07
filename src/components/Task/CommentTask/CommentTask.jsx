import { useState, useEffect } from "react";
import "./CommentTask.scss";
import avatar from "../../../assets/ava-chat.png";
import smileIcon from "../../../assets/commentIcon/smile_icon.png";
import imageIcon from "../../../assets/commentIcon/image_icon.png";
import tagIcon from "../../../assets/commentIcon/tag_icon.png";
import ReviewService from "../../../service/ReviewService";
import userApi from "../../../service/UserService";
import { useAuth } from "../../../context/AuthProvider";
import { FaPen, FaTrashAlt, FaCheck } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import { comment } from "postcss";

const CommentTask = ({ task, isClose, handleDeleteReRender }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [userMap, setUserMap] = useState({});
  const { user } = useAuth();
  const { getUserById } = userApi();
  const { getAllReview, createReview, deleteReview } = ReviewService();

  useEffect(() => {
    if (task) handleGetCommentTask();
  }, [task]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleGetCommentTask = async () => {
    try {
      const res = await getAllReview(user?.token, task);
      if (res?.data) {
        const data = res.data;
        setComments(data);

        const userIds = [...new Set(data.map((c) => c.createdBy))];
        const userResults = await Promise.all(
          userIds.map((id) => getUserById(user.token, id))
        );

        const map = {};
        userResults.forEach((u) => {
          map[u._id] = u;
        });
        setUserMap(map);
      }
    } catch (err) {
      console.error("Error fetching comments:", err.message);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = { reviewContent: newComment, taskId: task };
      const res = await createReview(user?.token, payload);
      if (res) {
        setNewComment("");
        handleGetCommentTask();
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await deleteReview(user.token, commentId);

      console.log(result)
    } catch (e) {
      throw new Error(e.message)
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
        reviewContent: editedComment,
        taskId: task,
        reviewId: editingCommentId,
      };

      const res = await createReview(user?.token, payload);
      setEditingCommentId(null);
      setEditedComment("");
      handleGetCommentTask();
    } catch (e) {
      console.error("Update failed:", e.message);
    }
  };

  return (
    <div className="comment__task__container">
      <div className="comment__task__header">
        <h2>Comment</h2>
        <i className="fa-solid fa-xmark close-icon" onClick={isClose}></i>
      </div>

      <div className="comment__task__body">
        {comments.length > 0 ? (
          comments.map((item, index) => (
            <div className="comment__task__card" key={index}>
              <div className="comment__task__card__header">
                <div className="infor__user">
                  <img
                    src={
                      item.avatar_link ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt="avatar"
                  />
                  <div>
                    <p className="infor__user__name">
                      {userMap[item.createdBy]?.full_name || "User"}
                    </p>
                    <p className="infor__user__create">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="comment__task__card__content">
                <div className="comment__task__card__content__container">
                  {editingCommentId === item.reviewId ? (
                    <div className="comment__edit__container">
                      <input
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="comment__edit__input"
                      />
                      <FaCheck
                        size={14}
                        className="comment-icon comment-icon-check"
                        onClick={handleUpdateComment}
                      />
                    </div>
                  ) : (
                    <>
                      <p>{item.reviewContent}</p>
                      <div className="comment__task__card__content__container__feature">
                        <FaPen
                          size={12}
                          className="comment-icon comment-icon-pen"
                          onClick={() => handleEditComment(item)}
                        />
                        <FaTrashAlt
                          size={12}
                          className="comment-icon comment-icon-trash"
                          onClick={() => handleDeleteComment(item.reviewId)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <h2 className="no__content">No Comment for this task!</h2>
        )}
      </div>

      <div className="comment__task__footer">
        <img src={avatar} alt="Current user avatar" />
        <div className="comment__task__create__content">
          <textarea
            placeholder="Enter comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <div className="wrapper_icon_comment">
            <div className="wrapper_icon_features">
              <img src={smileIcon} alt="Smile icon" />
              <img src={tagIcon} alt="Tag icon" />
              <img src={imageIcon} alt="Image icon" />
            </div>
            <button className="send__comment" onClick={handleSendComment}>
              <BsFillSendFill />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentTask;
