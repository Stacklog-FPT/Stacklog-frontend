import React, { useEffect, useRef, useState } from "react";
import { addPlanApi } from "../../../../service/PlanService";
import decodeToken from "../../../../service/DecodeJwt";
import "./AddTopicForm.scss";
import { FiPlus, FiTrash2, FiPaperclip } from "react-icons/fi";

const AddTopicForm = ({
  classId,
  groupId,
  token,
  dispatch,
  disabled,
  open: openProp,
  setOpen: setOpenProp,
}) => {
  // Nếu truyền prop open/setOpen thì dùng, không thì tự quản lý state
  const [openState, setOpenState] = useState(false);
  const open = typeof openProp === "boolean" ? openProp : openState;
  const setOpen = setOpenProp || setOpenState;

  const [form, setForm] = useState({
    topicTitle: "",
    topicAbbreviation: "",
    topicDescription: "",
    topicObjective: "",
    attachments: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  let userId = "";
  if (token) {
    const decoded = decodeToken(token);
    userId = decoded?.id || "";
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
    }));
    setForm((s) => ({
      ...s,
      attachments: [...s.attachments, ...newAttachments],
    }));
  };

  const removeAttachment = (idx) => {
    setForm((s) => ({
      ...s,
      attachments: s.attachments.filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    if (!classId || !groupId) return "Thiếu classId hoặc groupId.";
    if (!form.topicTitle.trim()) return "Vui lòng nhập tên đề tài.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);
    try {
      const generatedId = "topic" + Math.random().toString(36).slice(2, 8);
      const planData = {
        ...form,
        id: generatedId,
        topicId: generatedId,
        classId,
        groupId,
        status: "Pending",
        registerBy: userId,
        registerAt: new Date().toISOString(),
        rejectReason: null,
        approvedBy: null,
        approvedAt: null,
        attachments: form.attachments || [],
      };
      await addPlanApi(planData, token, dispatch);

      setForm({
        topicTitle: "",
        topicAbbreviation: "",
        topicDescription: "",
        topicObjective: "",
        attachments: [],
      });
      setOpen(false);
    } catch {
      setError("Lỗi khi thêm đề tài");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return <div className="plan__add-topic-form__center-btn"></div>;

  return (
    <div
      className="sl-modal"
      onClick={() => !loading && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-topic-title"
    >
      <div
        className="sl-modal__card sl-modal__card--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="sl-modal__close"
          type="button"
          aria-label="Đóng"
          onClick={() => !loading && setOpen(false)}
          disabled={loading}
        >
          ×
        </button>

        <div id="add-topic-title" className="sl-modal__title">
          Register New Topic
        </div>

        <form className="sl-form" onSubmit={handleSubmit} noValidate>
          <div className="sl-form__grid">
            <input
              ref={firstInputRef}
              name="topicTitle"
              placeholder="Tên đề tài *"
              value={form.topicTitle}
              onChange={handleChange}
              required
              className="sl-input"
              disabled={loading}
            />
            <input
              name="topicAbbreviation"
              placeholder="Viết tắt (tuỳ chọn)"
              value={form.topicAbbreviation}
              onChange={handleChange}
              className="sl-input"
              disabled={loading}
            />
            <textarea
              name="topicDescription"
              placeholder="Mô tả"
              value={form.topicDescription}
              onChange={handleChange}
              className="sl-textarea"
              disabled={loading}
            />
            <textarea
              name="topicObjective"
              placeholder="Mục tiêu"
              value={form.topicObjective}
              onChange={handleChange}
              className="sl-textarea"
              disabled={loading}
            />

            <div className="sl-upload">
              <label className="sl-label">File đính kèm</label>
              <div className="sl-upload__row">
                <label className="sl-btn sl-btn--ghost">
                  <FiPaperclip />
                  Chọn file
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    hidden
                  />
                </label>
                <div className="sl-upload__hint">
                  Hỗ trợ nhiều file. Dung lượng lớn nên dùng link Drive.
                </div>
              </div>

              {form.attachments.length > 0 && (
                <div className="sl-filechips">
                  {form.attachments.map((att, idx) => (
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
                        disabled={loading}
                        aria-label={`Xoá ${att.fileName}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!!error && (
            <div className="sl-alert sl-alert--danger" role="alert">
              {error}
            </div>
          )}

          <div className="sl-actions sl-actions--center">
            <button
              type="submit"
              className="sl-btn sl-btn--primary"
              disabled={loading || disabled}
            >
              {loading ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              className="sl-btn sl-btn--ghost"
              onClick={() => !loading && setOpen(false)}
              disabled={loading}
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTopicForm;
