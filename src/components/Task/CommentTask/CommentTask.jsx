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

const CommentTask = ({ taskId, isClose }) => {
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
  const { user } = useAuth();
  const { getAllReview } = ReviewService();

  const handleGetCommentTask = async () => {
    try {
      const response = await getAllReview(user?.token, taskId);
      console.log("Comments from API:", response.data);
      if (response && response.data) {
        setComments(response.data);
      }
    } catch (e) {
      console.error("Error fetching comments:", e.message);
    }
  };

  useEffect(() => {
    handleGetCommentTask();
  }, [taskId, user?.token]);

  const handleSendComment = () => {
    // Giả định hàm gửi comment (cần triển khai API)
    console.log("Send comment clicked");
  };

  return (
    <div className="comment__task__container">
      <div className="comment__task__header">
        <h2>Comment</h2>
        <i className="fa-solid fa-xmark" onClick={isClose}></i>
      </div>
      <div className="comment__task__body">
        {comments.length > 0 ? (
          comments.map((item) => (
            <div className="comment__task__card" key={item.id}>
              <div className="comment__task__card__header">
                <div className="infor__user">
                  <img src={item.avatar} alt="User avatar" />
                  <p className="infor__user__name">{item.name}</p>
                  <p className="infor__user__create">{item.createAt}</p>
                </div>
                <img src={iconMore} alt="More options" />
              </div>
              <div className="comment__task__card__content">
                <p>{item.content}</p>
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
          <textarea placeholder="Enter comment"></textarea>
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
