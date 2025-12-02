import React from "react";
import { ClipLoader, BarLoader, SyncLoader } from "react-spinners";
import "./LoadingComponent.scss";

const LoadingComponent = ({ isLoading = true, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <SyncLoader
          color="#045745"
          size={15}
          speedMultiplier={0.8}
          margin={8}
        />
        {/* Hoặc dùng ClipLoader nếu thích */}
        {/* <ClipLoader color="#045745" size={50} /> */}
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingComponent;
