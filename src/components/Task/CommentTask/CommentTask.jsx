import React, { useState } from "react";
import "./CommentTask.scss";
import avatar from "../../../assets/ava-chat.png";
import iconMore from "../../../assets/icon/task/iconMore.png";
import smileIcon from "../../../assets/commentIcon/smile_icon.png";
import imageIcon from "../../../assets/commentIcon/image_icon.png";
import tagIcon from "../../../assets/commentIcon/tag_icon.png";
import sendIcon from "../../../assets/commentIcon/send.png";
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
  const fetchCommentByTaskId = () => {
    // Call API Comment
  };
  return (
    <div className="comment__task__container">
      <div className="comment__task__header">
        <h2>Comment</h2>
        <i className="fa-solid fa-xmark" onClick={isClose}></i>
      </div>
      <div className="comment__task__body">
        {comments.length > 0 ? (
          comments.map((item) => {
            return (
              <div className="comment__task__card">
                <div className="comment__task__card__header">
                  <div className="infor__user">
                    <img src={item.avatar} />
                    <p className="infor__user__name">{item.name}</p>
                    <p className="infor__user__create">{item.createAt}</p>
                  </div>
                  <img src={iconMore} alt="icon..." />
                </div>
                <div className="comment__task__card__content">
                  <p>{item.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <h2>No Comment for this task!</h2>
        )}
      </div>
      <div className="comment__task__footer">
        {/* Get Avatar Current User */}
        <img src={avatar} />
        <div className="comment__task__create__content">
          <textarea placeholder="Enter comment"></textarea>
          <div className="wrapper_icon_comment">
            <div className="wrapper_icon_features">
              <img src={smileIcon} alt="...icon" />
              <img src={tagIcon} alt="...icon" />
              <img src={imageIcon} alt="...icon" />
            </div>
            <button className="send__comment">
              <img src={sendIcon} alt="...icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentTask;
