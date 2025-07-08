import React, { useState } from "react";
import "./LoginPage.scss";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import userApi from "../../service/UserService";
import logo from "../../assets/logo-login.png";
import { useAuth } from "../../context/AuthProvider";

const LoginPage = () => {
  const { loginSave } = useAuth();
  const { login, error, isLoading } = userApi();
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassWord] = useState("");
  const navigate = useNavigate();
  const handleGoogleSuccess = (credentialResponse) => {};
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await login(email, password);
      if (response) {
        const userData = {
          email: response.email,
          username: response.username,
          token: response.token,
        };
        
        loginSave(userData);
        navigate("/");
      }
    } catch (e) {
      console.error("Login Failed", e || e.message);
    }
  };
  const handleGoogleFailure = () => {};

  return (
    <GoogleOAuthProvider>
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
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassWord(e.target.value)}
                />
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
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                text="signin_with"
                logo_alignment="left"
                width="382"
              />
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
