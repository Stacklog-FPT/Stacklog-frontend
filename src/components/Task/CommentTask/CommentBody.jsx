import { FaPen, FaTrashAlt, FaCheck } from 'react-icons/fa';
import { formatDateUI } from '../../../helper/formatDate';

const CommentBody = ({
  reviews = [],
  userMap = {},
  decodedId,
  editingCommentId,
  editedComment,
  onEdit,
  onChangeEdited,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="comment__task__body">
      {reviews?.length > 0 ? (
        reviews.map((item, index) => (
          <div className="comment__task__card" key={item.reviewId ?? index}>
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
                    {userMap[item.createdBy]?.full_name || item.authorName || 'User'}
                  </p>
                  <p className="infor__user__create">{formatDateUI?.(item.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="comment__task__card__content">
              <div className="comment__task__card__content__container">
                {editingCommentId === item.reviewId ? (
                  <div className="comment__edit__container">
                    <input
                      value={editedComment}
                      onChange={(e) => onChangeEdited(e.target.value)}
                      className="comment__edit__input"
                    />
                    <FaCheck
                      size={14}
                      className="comment-icon comment-icon-check"
                      onClick={onUpdate}
                    />
                  </div>
                ) : (
                  <>
                    <p>{item.reviewContent}</p>
                    {decodedId === item.createdBy && (
                      <div className="comment__task__card__content__container__feature">
                        <FaPen
                          size={12}
                          className="comment-icon comment-icon-pen"
                          onClick={() => onEdit(item)}
                        />
                        <FaTrashAlt
                          size={12}
                          className="comment-icon comment-icon-trash"
                          onClick={() => onDelete(item.reviewId)}
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
  );
};

export default CommentBody;
