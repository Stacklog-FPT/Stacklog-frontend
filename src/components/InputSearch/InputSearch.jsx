import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./InputSearch.scss";
import ButtonMode from "../ButtonMode/ButtonMode";

const InputSearch = () => {
  const [searchItem, setSearchItem] = useState("");
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
        <div className="input-search-user-bell">
          <i className="fa-solid fa-bell"></i>
          <span className="input-search-user-bell-total">12</span>
        </div>
        <div className="input-search-user-avatar">
          <Link to={"/user-detail"}>
            <img src="https://scontent.fsgn2-4.fna.fbcdn.net/v/t51.75761-15/487464014_17855438160405001_2975665951900708652_n.jpg?stp=dst-jpegr_tt6&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=pusnwsmEescQ7kNvwEUXcV0&_nc_oc=AdmYr6UmF9nTAPcZbC5Vv_UV8MNETpyyHxQSmqCf1Ueb60gbjBJqlw4A_81iAK3xIO0YvsC06MGY235dYbXtWZuk&_nc_zt=23&se=-1&_nc_ht=scontent.fsgn2-4.fna&_nc_gid=NmGpzOpK3AXB6KuFyXuIzw&oh=00_AfHIGhTyg_7RFERo4uPXa8bgTINH0isdPi7EoCkAN9kiNQ&oe=6804D738" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InputSearch;
