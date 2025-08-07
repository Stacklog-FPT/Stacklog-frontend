import React from "react";
import "./PopupInviteCode.scss";

const PopupInviteCode = ({
  inviteCode,
  setShowInvitePopup,
}) => (
  <div className="popup-create-class">
    <div className="popup-content">
      <h3>Invite Code</h3>
      <input
        type="text"
        value={inviteCode}
        readOnly
        style={{ marginBottom: "10px" }}
      />
      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        <span>Link gửi cho sinh viên:</span>
        <br />
        <span style={{ color: "#3498db", wordBreak: "break-all" }}>
          {inviteCode
            ? `${window.location.origin}/join-class/${inviteCode}`
            : ""}
        </span>
      </div>
      <div className="popup-actions">
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/join-class/${inviteCode}`
            );
          }}
          className="btn-confirm"
        >
          Copy Link
        </button>
        <button
          onClick={() => setShowInvitePopup(false)}
          className="btn-cancel"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
);

export default PopupInviteCode;