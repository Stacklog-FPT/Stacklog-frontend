import React, { useState } from "react";
import "./LoginPage.scss";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import userApi from "../../service/UserService";
import logo from "../../assets/logo-login.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const { login, error, isLoading } = userApi();
  // const handleGoogleSuccess = (credentialResponse) => {};

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await login(email, passWord);
      console.log("Login successfully: ", response);
    } catch (e) {
      console.error("Login Failed", e || e.message);
    }
  };
  // const handleGoogleFailure = () => {};

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
                  value={passWord}
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
            </div>
            <div className="form_wrapper_button">
              <button className="form_wrapper_button_field">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              {/* <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                text="signin_with"
                logo_alignment="left"
                width="382"
              /> */}
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
