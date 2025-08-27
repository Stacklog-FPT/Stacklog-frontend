import React from "react";
import "./DetailTopicForm.scss";

const DetailTopicForm = ({
  open,
  topic,
  group,
  role,
  actionLoading,
  rejectReason,
  setRejectReason,
  localError,
  setLocalError,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!open || !topic) return null;

  return (
    <div className="plan__modal-overlay" role="dialog" aria-modal="true">
      <div className="plan__modal-card">
        <button
          className="plan__btn-close plan__modal-close-btn"
          onClick={() => {
            onClose();
            setRejectReason && setRejectReason("");
            setLocalError && setLocalError("");
          }}
        >
          Đóng
        </button>

        <h2 className="plan__modal-title">
          Đăng ký đề tài nhóm <span>{group?.groupsName || "-"}</span> – Lớp{" "}
          {group?.className || "-"}
        </h2>

        <div className="plan__modal-info-grid">
          <div>
            <span className="plan__modal-label">Nhóm:</span>{" "}
            {group?.groupsName || "-"}
          </div>
          <div>
            <span className="plan__modal-label">Leader:</span>{" "}
            {group?.groupsLeaderId || "-"}
          </div>
          <div>
            <span className="plan__modal-label">Thành viên:</span>{" "}
            {group?.groupStudent?.join(", ") || "-"}
          </div>
          <div>
            <span className="plan__modal-label">Tên đề tài:</span>{" "}
            {topic.topicTitle}
          </div>
          <div>
            <span className="plan__modal-label">Viết tắt:</span>{" "}
            {topic.topicAbbreviation}
          </div>
          <div>
            <span className="plan__modal-label">Mô tả:</span>{" "}
            {topic.topicDescription}
          </div>
          <div>
            <span className="plan__modal-label">Mục tiêu:</span>{" "}
            {topic.topicObjective}
          </div>
          <div>
            <span className="plan__modal-label">Ngày đăng ký:</span>{" "}
            {topic.registerAt
              ? new Date(topic.registerAt).toLocaleDateString()
              : "-"}
          </div>
          <div>
            <span className="plan__modal-label">File đính kèm:</span>{" "}
            {Array.isArray(topic.attachments) &&
            topic.attachments.length > 0 ? (
              <ul className="plan__modal-file-list">
                {topic.attachments.map((file, idx) => (
                  <li key={idx}>
                    {file.fileName || file.name || `File ${idx + 1}`}{" "}
                    <a
                      href={file.fileUrl || file.url || "#"}
                      download
                      className="plan__modal-file-link"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              "Không có"
            )}
          </div>
          <div>
            <span className="plan__modal-label">Trạng thái đăng ký:</span>{" "}
            <span
              className={`plan__modal-status plan__modal-status--${(
                topic.status || ""
              ).toLowerCase()}`}
            >
              {topic.status}
            </span>
          </div>
          {topic.status === "Rejected" && (
            <div>
              <span className="plan__modal-label">Lý do từ chối:</span>{" "}
              {topic.rejectReason}
            </div>
          )}
        </div>

        {role === "LECTURER" && topic.status === "Pending" && (
          <div className="plan__modal-action-row">
            <button
              className="plan__btn-approve"
              disabled={actionLoading}
              onClick={onApprove}
            >
              Approve
            </button>
            <button
              className="plan__btn-reject"
              disabled={actionLoading}
              onClick={onReject}
            >
              Reject
            </button>
            <input
              type="text"
              className="plan__modal-reject-input"
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) =>
                setRejectReason && setRejectReason(e.target.value)
              }
              disabled={actionLoading}
            />
          </div>
        )}

        {localError && (
          <div className="plan__error" style={{ marginTop: 12 }}>
            {localError}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailTopicForm;
