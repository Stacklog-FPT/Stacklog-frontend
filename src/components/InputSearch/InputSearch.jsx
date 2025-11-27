import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./InputSearch.scss";
import ButtonMode from "../ButtonMode/ButtonMode";
import { AnnouncementContext } from "../../context/AnnoucementContext";
import { useSelector } from "react-redux";

const InputSearch = () => {
  const [searchItem, setSearchItem] = useState("");
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const { toggleAnnouncement } = useContext(AnnouncementContext);
  const { userInfo } = useSelector((state) => state.users);
  const { notifications } = useSelector((state) => state.notification);
  const isHaveUnread = notifications.some((nt) => !nt.isRead);

  const handleChange = (e) => {
    setSearchItem(e.target.value);
  };

  return (
    <div className="input-search">
      <div className="input-search-home">
        <Link>
          <i className="fa-solid fa-house"></i>
        </Link>
      </div>
      <div className="input-search-field">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Search"
          value={searchItem}
          onChange={handleChange}
        />
      </div>
      <div className="input-search-user">
        <ButtonMode />
        <div className="input-search-user-bell" onClick={toggleAnnouncement}>
          <i
            className={`fa-solid fa-bell ${
              isAnnouncementVisible ? "active" : ""
            }`}
          ></i>
          {isHaveUnread && (
            <span className="input-search-user-bell-total"></span>
          )}
        </div>
        <div className="input-search-user-avatar">
          <Link to={"/user-detail"}>
            {userInfo?.avatar_link ? (
              <img src={userInfo.avatar_link} alt="..." />
            ) : (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyxOFawuDBFgxqKvyTSXmrWv_8vDw9xyhvOg&s"
                alt="..."
              />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InputSearch;
