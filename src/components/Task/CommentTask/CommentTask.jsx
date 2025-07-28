import React, { useState, useEffect } from "react";
import "./CommentTask.scss";
import avatar from "../../../assets/ava-chat.png";
import iconMore from "../../../assets/icon/task/iconMore.png";
import smileIcon from "../../../assets/commentIcon/smile_icon.png";
import imageIcon from "../../../assets/commentIcon/image_icon.png";
import tagIcon from "../../../assets/commentIcon/tag_icon.png";
import sendIcon from "../../../assets/commentIcon/send.png";
import ReviewService from "../../../service/ReviewService";
import { useAuth } from "../../../context/AuthProvider";

const CommentTask = ({ isClose, task }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      avatar: avatar,
      name: "LongBuaDinh",
      content: "Chuan chuan",
      createAt: "March 23",
    },
    {
      id: 2,
      avatar: avatar,
      name: "NhatChumChim",
      content: "Dep me het di code lam cc chi",
      createAt: "March 22",
    },
    {
      id: 3,
      avatar: avatar,
      name: "Thanh52Cay",
      content: "Chiu mai ban di keo xi dach r",
      createAt: "March 20",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  console.log(task);
  const { user } = useAuth();
  const { getAllReview, createReview } = ReviewService();

  const handleGetCommentTask = async () => {
    try {
      const response = await getAllReview(user?.token, task.taskId);

      if (response && response.data) {
        // console.log(response);
        setComments(response.data);
      }
    } catch (e) {
      console.error("Error fetching comments:", e.message);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = {
        reviewContent: newComment,
        task: task,
      };
      console.log(payload);
      const response = await createReview(user?.token, payload);
      if (response) {
        setNewComment("");
        handleGetCommentTask();
        // console.log(response);
      }
    } catch (e) {
      throw new Error(e.message);
    }
    console.log("Send comment clicked");
  };

  useEffect(() => {
    handleGetCommentTask();
  }, [task, user?.token]);

  return (
    <div className="comment__task__container">
      <div className="comment__task__header">
        <h2>Comment</h2>
        <i className="fa-solid fa-xmark" onClick={isClose}></i>
      </div>
      <div className="comment__task__body">
        {comments.length > 0 ? (
          comments.map((item, index) => (
            <div className="comment__task__card" key={index}>
              {/* <div className="comment__task__card__header">
                <div className="infor__user">
                  <img src={item.avatar} alt="User avatar" />
                  <p className="infor__user__name">{item.name}</p>
                  <p className="infor__user__create">{item.createAt}</p>
                </div>
                <img src={iconMore} alt="More options" />
              </div> */}
              <div className="comment__task__card__content">
                <p>{item.reviewContent}</p>
              </div>
            </div>
          ))
        ) : (
          <h2>No Comment for this task!</h2>
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
              <img src={sendIcon} alt="Send icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentTask;
