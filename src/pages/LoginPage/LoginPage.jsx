import React, { useState } from "react";
import "./LoginPage.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import userApi from "../../service/UserService";
import logo from "../../assets/logo-login.png";
import { useAuth } from "../../context/AuthProvider";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { useDispatch } from "react-redux";

const LoginPage = () => {
  const { loginSave } = useAuth();
  const { login, loginGoogle, getUserById, error, isLoading } = userApi();
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassWord] = useState("");
  const [showPassWord, setShowPassWord] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";
  const dispatch = useDispatch();
  const handleLoginGoogle = async (response) => {
    const { credential } = response;
    if (credential) {
      const response = await loginGoogle(credential);
      if (response) {
        const userData = {
          email: response.data.email,
          username: response.data.username,
          token: response.data.token,
          role: response.data.role,
        };

        loginSave(userData);
        navigate(redirect);
      }
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response) {
        const userData = {
          email: response.email,
          username: response.username,
          token: response.token,
          role: response.role,
        };
        await loginSave(userData);
        await getUserById(response.token, response._id, dispatch);
        if (userData.role === "ADMIN") {
          navigate("/admin");
          return;
        }
        navigate(redirect);
      }
    } catch (e) {
      console.error("Login Failed", e || e.message);
    }
  };

  return (
    <GoogleOAuthProvider clientId="936936448941-in2ggpv40tvh3489tv0n79ou5rqjvqd0.apps.googleusercontent.com">
      <div className="form-login-container">
        <div className="wrapper-form">
          <div className="form_text">
            <img src={logo} alt="this is my logo" className="form_text_logo" />
            <h1 className="form_text_heading">Welcome back</h1>
            <p className="form_text_content">
              Welcome back! Please enter your details.
            </p>
          </div>
          <form className="form" onSubmit={handleLogin}>
            <div className="form_wrapper_input">
              <div className="form_wrapper_input_field">
                <label className="form_wrapper_input_field_label">Email</label>
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form_wrapper_input_field">
                <label className="form_wrapper_input_field_label">
                  Password
                </label>
                {showPassWord ? (
                  <input
                    type="type"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassWord(e.target.value)}
                  />
                ) : (
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassWord(e.target.value)}
                  />
                )}
              </div>
              <div className="form_wrapper_visibility">
                {showPassWord ? (
                  <MdOutlineVisibilityOff
                    className="form_wrapper_visibility_icon"
                    onClick={() => setShowPassWord(!showPassWord)}
                  />
                ) : (
                  <MdOutlineVisibility
                    className="form_wrapper_visibility_icon"
                    onClick={() => setShowPassWord(!showPassWord)}
                  />
                )}
              </div>
              <div className="form_wrapper_checkbox">
                <div className="form_wrapper_checkbox_field">
                  <input type="checkbox" id="remember-checkbox" />
                  <label
                    htmlFor="remember-checkbox"
                    className="form_wrapper_checkbox_field_label"
                  >
                    Remember for 30 days
                  </label>
                </div>
                <div className="form_wrapper_checkbox_forgot">
                  <Link>Forgot password</Link>
                </div>
              </div>
              <div className="error-login">{error && <span>{error}</span>}</div>
            </div>
            <div className="form_wrapper_button">
              <button className="form_wrapper_button_field">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              <GoogleLogin
                className="google-login-btn"
                onSuccess={handleLoginGoogle}
                onError={() => {
                  console.log("Login failure!");
                }}
                text="signin_with"
                logo_alignment="left"
              />
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
