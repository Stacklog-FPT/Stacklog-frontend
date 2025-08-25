import React from 'react';
import './RightComponent.scss';
const RightComponent = () => {
  return (
    <div className="comment__task">
      <div className="comment__task__body">
        {reviews?.length > 0 ? (
          reviews?.map((item, index) => (
            <div className="comment__task__card" key={index}>
              <div className="comment__task__card__header">
                <div className="infor__user">
                  <img
                    src={
                      item.avatar_link ||
                      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                    }
                    alt="avatar"
                  />
                  <div>
                    <p className="infor__user__name">
                      {userMap[item.createdBy]?.full_name || 'User'}
                    </p>
                    <p className="infor__user__create">{formatDate(item.createdAt)}</p>
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
                      {decoded.id === item.createdBy && (
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
                      )}
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
        <img
          src={
            'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
          }
          alt="avatar"
        />
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

export default RightComponent;
