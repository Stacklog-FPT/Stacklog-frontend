import "./LoadingComponent.scss";
import mainLogo from "../../assets/main-logo.png";

const LoadingComponent = ({
  isLoading,
  message = "Đang chuẩn bị bảng công việc...",
  subMessage = "Chờ xíu nha",
}) => {
  if (!isLoading) return null;

  return (
    <div className="global-loading">
      <div className="loading-card">
        <div className="logo-bounce">
          <img src={mainLogo} alt="Logo" className="app-logo" />
        </div>

        <div className="dots-wave">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* <div className="loading-text">
          <p className="main">{message}</p>
          <p className="sub">{subMessage}</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoadingComponent;
