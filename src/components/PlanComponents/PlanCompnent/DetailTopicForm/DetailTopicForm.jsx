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
  onUpdate,
  onDelete,
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

  const [editMode, setEditMode] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    topicTitle: topic?.topicTitle || "",
    topicAbbreviation: topic?.topicAbbreviation || "",
    topicDescription: topic?.topicDescription || "",
    topicObjective: topic?.topicObjective || "",
    attachments: topic?.attachments ? [...topic.attachments] : [],
  });

  const [localTopic, setLocalTopic] = React.useState(topic);

  React.useEffect(() => {
    setLocalTopic(topic);
  }, [topic]);

  React.useEffect(() => {
    if (open && topic) {
      setEditMode(false);
      setEditForm({
        topicTitle: topic.topicTitle || "",
        topicAbbreviation: topic.topicAbbreviation || "",
        topicDescription: topic.topicDescription || "",
        topicObjective: topic.topicObjective || "",
        attachments: topic.attachments ? [...topic.attachments] : [],
      });
    }
  }, [open, topic]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAtts = files.map((f) => ({
      fileName: f.name,
      fileUrl: URL.createObjectURL(f),
      file: f,
    }));
    setEditForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAtts],
    }));
  };

  const removeAttachment = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  if (!open || !topic) return null;

  const canAct = role === "LECTURER" && localTopic?.status === "Pending";

  const canGrantEdit =
    role === "LECTURER" &&
    (localTopic?.status === "Approved" || localTopic?.status === "Rejected");

  const canEdit =
    role === "STUDENT" &&
    localTopic?.status === "Pending" &&
    localTopic?.allowEdit === true;

  const handleGrant = () => {
    if (!onUpdate) return;

    setLocalTopic((t) => ({ ...t, allowEdit: true, status: "Pending" }));
    onUpdate(topic.topicId, { allowEdit: true, status: "Pending" });
  };

  const handleApprove = () => {
    if (!onApprove) return;

    setLocalTopic((t) => ({ ...t, status: "Approved", allowEdit: false }));
    onApprove(topic.topicId);
  };

  const handleReject = () => {
    if (!onReject) return;

    if (!rejectReason || !rejectReason.trim()) {
      setLocalError && setLocalError("Vui lòng nhập lý do từ chối");
      return;
    }
    setLocalError && setLocalError(null);
    setLocalTopic((t) => ({
      ...t,
      status: "Rejected",
      allowEdit: false,
      rejectReason,
    }));
    onReject(topic.topicId, rejectReason);

    setRejectReason && setRejectReason("");
  };

  const handleSaveEdit = () => {
    if (!onUpdate) return;

    setLocalTopic((t) => ({ ...t, ...editForm }));
    setEditMode(false);
    onUpdate(topic.topicId, editForm);
  };

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
            {editMode ? (
              <input
                className="sl-input"
                value={editForm.topicTitle}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, topicTitle: e.target.value }))
                }
                disabled={actionLoading}
                required
              />
            ) : (
              <div className="sl-strong">{topic.topicTitle}</div>
            )}
          </div>

          <div>
            <div className="sl-label">Viết tắt</div>
            {editMode ? (
              <input
                className="sl-input"
                value={editForm.topicAbbreviation}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    topicAbbreviation: e.target.value,
                  }))
                }
                disabled={actionLoading}
              />
            ) : (
              <div className="sl-kbd">{topic.topicAbbreviation || "-"}</div>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Mô tả</div>
            {editMode ? (
              <textarea
                className="sl-textarea"
                value={editForm.topicDescription}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    topicDescription: e.target.value,
                  }))
                }
                disabled={actionLoading}
              />
            ) : (
              <div className="sl-preline">{topic.topicDescription || "-"}</div>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Mục tiêu</div>
            {editMode ? (
              <textarea
                className="sl-textarea"
                value={editForm.topicObjective}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, topicObjective: e.target.value }))
                }
                disabled={actionLoading}
              />
            ) : (
              <div className="sl-preline">{topic.topicObjective || "-"}</div>
            )}
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
            <div
              className={`sl-badge sl-badge--${(
                topic.status || ""
              ).toLowerCase()}`}
            >
              {topic.status}
            </div>
            {localTopic?.allowEdit && localTopic?.status === "Pending" && (
              <div className="sl-hint">
                Đang mở quyền chỉnh sửa cho sinh viên
              </div>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">File đính kèm</div>
            {editMode ? (
              <>
                <label className="sl-btn sl-btn--ghost">
                  <FiPaperclip /> Chọn file
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={actionLoading}
                    hidden
                  />
                </label>
                <div className="sl-upload__hint">
                  Hỗ trợ nhiều file. Dung lượng lớn nên dùng link Drive.
                </div>
                {editForm.attachments.length > 0 && (
                  <div className="sl-filechips">
                    {editForm.attachments.map((att, idx) => (
                      <div key={idx} className="sl-chip">
                        <span className="sl-chip__label" title={att.fileName}>
                          {att.fileName}
                        </span>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sl-chip__link"
                        >
                          Xem
                        </a>
                        <button
                          type="button"
                          className="sl-chip__remove"
                          onClick={() => removeAttachment(idx)}
                          disabled={actionLoading}
                          aria-label={`Xoá ${att.fileName}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : Array.isArray(topic.attachments) &&
              topic.attachments.length > 0 ? (
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

        {/* === LECTURER: Cấp/thu hồi quyền === */}
        {canGrantEdit && (
          <div className="sl-actions" style={{ marginTop: 12 }}>
            <button
              className="sl-btn sl-btn--primary"
              disabled={actionLoading}
              onClick={handleGrant}
            >
              Cấp quyền chỉnh sửa/xóa (đưa về Pending)
            </button>
          </div>
        )}

        {/* === LECTURER: Duyệt/Từ chối khi Pending & chưa mở quyền cho SV === */}
        {canAct && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--success"
              disabled={actionLoading}
              onClick={handleApprove}
            >
              <FiCheckCircle />
              Duyệt
            </button>
            <button
              className="sl-btn sl-btn--danger"
              disabled={actionLoading}
              onClick={handleReject}
            >
              <FiXCircle />
              Từ chối
            </button>
            <input
              type="text"
              className="sl-input sl-input--inline"
              placeholder="Nhập lý do từ chối…"
              value={rejectReason}
              onChange={(e) =>
                setRejectReason && setRejectReason(e.target.value)
              }
              disabled={actionLoading}
            />
          </div>
        )}

        {/* === STUDENT: Cảnh báo khi không có quyền === */}
        {role === "STUDENT" && !canEdit && (
          <div className="sl-alert sl-alert--warning" style={{ marginTop: 12 }}>
            Bạn hiện <b>không có quyền</b> cập nhật/xóa đề tài. Vui lòng liên hệ
            giảng viên để được cấp quyền.
          </div>
        )}

        {/* === STUDENT: Nút cập nhật/xoá === */}
        {canEdit && !editMode && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--primary"
              disabled={actionLoading}
              onClick={() => setEditMode(true)}
            >
              Cập nhật
            </button>
            <button
              className="sl-btn sl-btn--danger"
              disabled={actionLoading}
              onClick={() => onDelete && onDelete(topic.topicId)}
            >
              Xóa
            </button>
          </div>
        )}

        {/* === STUDENT: Đang chỉnh sửa === */}
        {canEdit && editMode && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--success"
              disabled={actionLoading}
              onClick={handleSaveEdit}
            >
              Lưu thay đổi
            </button>
            <button
              className="sl-btn sl-btn--ghost"
              disabled={actionLoading}
              onClick={() => setEditMode(false)}
            >
              Hủy
            </button>
          </div>
        )}

        {localError && (
          <div className="sl-alert sl-alert--danger">{localError}</div>
        )}
      </div>
    </div>
  );
};

export default DetailTopicForm;
