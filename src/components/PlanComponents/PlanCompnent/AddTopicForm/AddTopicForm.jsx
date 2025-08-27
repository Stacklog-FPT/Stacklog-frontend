import React, { useEffect, useRef, useState } from "react";
import { addPlanApi } from "../../../../service/PlanService";
import "./AddTopicForm.scss";

const AddTopicForm = ({ classId, groupId, token, dispatch, disabled }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    topicTitle: "",
    topicAbbreviation: "",
    topicDescription: "",
    topicObjective: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Đóng bằng ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus vào input đầu khi mở
  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [open]);

  const validate = () => {
    if (!classId || !groupId) return "Thiếu classId hoặc groupId.";
    if (!form.topicTitle.trim()) return "Vui lòng nhập tên đề tài.";
    if (form.topicTitle.length > 100) return "Tên đề tài tối đa 100 ký tự.";
    if (form.topicAbbreviation.length > 30) return "Viết tắt tối đa 30 ký tự.";
    if (form.topicDescription.length > 300) return "Mô tả tối đa 300 ký tự.";
    if (form.topicObjective.length > 300) return "Mục tiêu tối đa 300 ký tự.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      await addPlanApi(
        {
          ...form,
          classId,
          groupId,
          status: "Pending",
          registerAt: new Date().toISOString(),
        },
        token,
        dispatch
      );

      // reset form
      setForm({
        topicTitle: "",
        topicAbbreviation: "",
        topicDescription: "",
        topicObjective: "",
      });
      setOpen(false);
    } catch (err) {
      setError("Lỗi khi thêm đề tài");
    } finally {
      setLoading(false);
    }
  };

  if (!open)
    return (
      <div className="plan__add-topic-form__center-btn">
        <button
          className="plan__btn-add"
          onClick={() => setOpen(true)}
          disabled={disabled}
          type="button"
        >
          + Đăng ký đề tài mới
        </button>
      </div>
    );

  return (
    <div
      className="plan__add-topic-overlay"
      onClick={() => !loading && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-topic-title"
    >
      <div
        className="plan__add-topic-card plan__add-topic-card--modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="plan__add-topic-close"
          type="button"
          aria-label="Đóng"
          onClick={() => !loading && setOpen(false)}
          disabled={loading}
        >
          ×
        </button>

        <div id="add-topic-title" className="plan__add-topic-form__title">
          Đăng ký đề tài mới
        </div>

        <form
          className="plan__add-topic-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="plan__add-topic-form__fields">
            <input
              ref={firstInputRef}
              name="topicTitle"
              placeholder="Tên đề tài *"
              value={form.topicTitle}
              onChange={handleChange}
              required
              className="plan__add-topic-form__input"
              maxLength={100}
              disabled={loading}
            />
            <input
              name="topicAbbreviation"
              placeholder="Viết tắt"
              value={form.topicAbbreviation}
              onChange={handleChange}
              className="plan__add-topic-form__input"
              maxLength={30}
              disabled={loading}
            />
            <textarea
              name="topicDescription"
              placeholder="Mô tả"
              value={form.topicDescription}
              onChange={handleChange}
              className="plan__add-topic-form__textarea"
              maxLength={300}
              disabled={loading}
            />
            <textarea
              name="topicObjective"
              placeholder="Mục tiêu"
              value={form.topicObjective}
              onChange={handleChange}
              className="plan__add-topic-form__textarea"
              maxLength={300}
              disabled={loading}
            />
          </div>

          <div className="plan__add-topic-form__meta">
            <div>
              <span className="meta-key">Lớp:</span>{" "}
              <span className="meta-val">{classId || "-"}</span>
            </div>
            <div>
              <span className="meta-key">Nhóm:</span>{" "}
              <span className="meta-val">{groupId || "-"}</span>
            </div>
          </div>

          {!!error && (
            <div className="plan__error" role="alert">
              {error}
            </div>
          )}

          <div className="plan__add-topic-form__actions">
            <button
              type="submit"
              className="plan__btn-save"
              disabled={loading || disabled}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              className="plan__btn-cancel"
              onClick={() => !loading && setOpen(false)}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTopicForm;
