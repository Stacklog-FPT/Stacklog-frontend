import React, { useRef, useEffect } from "react";
import "./DetailTopicForm.scss";
import { FiX, FiCheckCircle, FiXCircle, FiPaperclip } from "react-icons/fi";

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
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !actionLoading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, actionLoading, onClose]);

  if (!open || !topic) return null;

  const canAct = role === "LECTURER" && topic.status === "Pending";

  return (
    <div
      className="sl-modal"
      role="dialog"
      aria-modal="true"
      onClick={() => !actionLoading && onClose()}
    >
      <div
        className="sl-modal__card"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="sl-modal__close"
          onClick={() => !actionLoading && onClose()}
          aria-label="Đóng"
          disabled={actionLoading}
        >
          <FiX />
        </button>

        <h3 className="sl-modal__title">
          Nhóm <span>{group?.groupsName || "-"}</span> – Lớp{" "}
          {group?.className || "-"}
        </h3>

        <div className="sl-grid">
          <div>
            <div className="sl-label">Leader</div>
            <div>{group?.groupsLeaderId || "-"}</div>
          </div>
          <div>
            <div className="sl-label">Thành viên</div>
            <div className="sl-muted">
              {group?.groupStudent?.join(", ") || "-"}
            </div>
          </div>
          <div>
            <div className="sl-label">Tên đề tài</div>
            <div className="sl-strong">{topic.topicTitle}</div>
          </div>
          <div>
            <div className="sl-label">Viết tắt</div>
            <div className="sl-kbd">{topic.topicAbbreviation || "-"}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Mô tả</div>
            <div className="sl-preline">{topic.topicDescription || "-"}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Mục tiêu</div>
            <div className="sl-preline">{topic.topicObjective || "-"}</div>
          </div>
          <div>
            <div className="sl-label">Ngày đăng ký</div>
            <div>
              {topic.registerAt
                ? new Date(topic.registerAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <div>
            <div className="sl-label">Trạng thái</div>
            <div className={`sl-badge sl-badge--${(topic.status || "").toLowerCase()}`}>
              {topic.status}
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">File đính kèm</div>
            {Array.isArray(topic.attachments) && topic.attachments.length > 0 ? (
              <ul className="sl-files">
                {topic.attachments.map((f, i) => (
                  <li key={i}>
                    <FiPaperclip />
                    <span title={f.fileName || f.name}>
                      {f.fileName || f.name || `File ${i + 1}`}
                    </span>
                    <a
                      href={f.fileUrl || f.url || "#"}
                      download
                      className="sl-link"
                    >
                      Tải
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="sl-muted">Không có</div>
            )}
          </div>

          {topic.status === "Rejected" && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="sl-label">Lý do từ chối</div>
              <div className="sl-preline">{topic.rejectReason}</div>
            </div>
          )}
        </div>

        {canAct && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--success"
              disabled={actionLoading}
              onClick={onApprove}
            >
              <FiCheckCircle />
              Duyệt
            </button>
            <button
              className="sl-btn sl-btn--danger"
              disabled={actionLoading}
              onClick={onReject}
            >
              <FiXCircle />
              Từ chối
            </button>
            <input
              type="text"
              className="sl-input sl-input--inline"
              placeholder="Nhập lý do từ chối…"
              value={rejectReason}
              onChange={(e) => setRejectReason && setRejectReason(e.target.value)}
              disabled={actionLoading}
            />
          </div>
        )}

        {localError && <div className="sl-alert sl-alert--danger">{localError}</div>}
      </div>
    </div>
  );
};

export default DetailTopicForm;
