import { useMemo, useState, useEffect } from "react";
import { FaPen, FaTrashAlt, FaCheck } from "react-icons/fa";
import { formatDateUI } from "../../../helper/formatDate";
import { fetchUserById } from "../../../service/UserService";
import { useAuth } from "../../../context/AuthProvider";

const CommentBody = ({
  reviews = [],
  decodedId,
  editingCommentId,
  editedComment,
  onEdit,
  onChangeEdited,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const [userMap, setUserMap] = useState({});
  const sortedReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];

    return [...reviews].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.updateAt || 0).getTime();
      const bTime = new Date(b.createdAt || b.updateAt || 0).getTime();
      return bTime - aTime;
    });
  }, [reviews]);

  useEffect(() => {
    if (!user?.token || reviews.length === 0) {
      setUserMap({});
      return;
    }

    const uniqueUserIds = [
      ...new Set(reviews.map((r) => r.createdBy).filter(Boolean)),
    ];

    const missingIds = uniqueUserIds.filter((id) => !userMap[id]);

    if (missingIds.length === 0) {
      return;
    }

    const fetchUsers = async () => {
      try {
        const responses = await Promise.all(
          missingIds.map((id) =>
            fetchUserById(user.token, id).catch(() => null)
          )
        );

        const newData = {};
        missingIds.forEach((id, i) => {
          if (responses[i]) {
            newData[id] = responses[i];
          }
        });

        setUserMap((prev) => ({ ...prev, ...newData }));
      } catch (err) {
        console.error("Fetch user failed:", err);
      }
    };

    fetchUsers();
  }, [user?.token, reviews, userMap]);
  console.log(sortedReviews);
  return (
    <div className="comment__task__body">
      {sortedReviews?.length > 0 ? (
        sortedReviews.map((item, index) => (
          <div className="comment__task__card" key={item.reviewId ?? index}>
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
                    {formatDateUI?.(item.createdAt)}
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
