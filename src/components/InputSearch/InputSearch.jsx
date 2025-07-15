import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./InputSearch.scss";
import ButtonMode from "../ButtonMode/ButtonMode";
import { AnnouncementContext } from "../../context/AnnoucementContext";
import { useAuth } from "../../context/AuthProvider";

const InputSearch = () => {
  const [searchItem, setSearchItem] = useState("");
  const { isAnnouncementVisible } = useContext(AnnouncementContext);
  const { toggleAnnouncement } = useContext(AnnouncementContext);
  const { user } = useAuth();
  
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
          <span className="input-search-user-bell-total"></span>
        </div>
        <div className="input-search-user-avatar">
          <Link to={"/user-detail"}>
            {user?.avatar ? (
              user?.avatar
            ) : (
              <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InputSearch;
