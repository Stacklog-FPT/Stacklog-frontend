import smileIcon from '../../../assets/commentIcon/smile_icon.png';
import imageIcon from '../../../assets/commentIcon/image_icon.png';
import tagIcon from '../../../assets/commentIcon/tag_icon.png';
import { BsFillSendFill } from 'react-icons/bs';

const CommentFooter = ({ avatar, newComment, onChangeNew, onSend }) => {
  return (
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
          onChange={(e) => onChangeNew(e.target.value)}
        ></textarea>
        <div className="wrapper_icon_comment">
          <div className="wrapper_icon_features">
            <img src={smileIcon} alt="Smile icon" />
            <img src={tagIcon} alt="Tag icon" />
            <img src={imageIcon} alt="Image icon" />
          </div>
          <button className="send__comment" onClick={onSend} aria-label="Send comment">
            <BsFillSendFill />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentFooter;
