import React from "react";
import "./Header.scss";
import MainLogo from "../../../assets/logo-landing.png";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="header-landing w-100">
      <div className="d-flex align-items-center justify-content-between w-100">
        <img src={MainLogo} alt="this is logo" />

        <div className="wrapper-btn d-flex align-items-center gap-3">
          <button className="sign-up" onClick={() => navigate("/login")}>
            Sign up
          </button>
          <button className="sign-in" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
