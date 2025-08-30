import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from 'react-redux';
import { addPlanApi } from "../../../../service/PlanService";
import decodeToken from "../../../../service/DecodeJwt";
import userApi from "../../../../service/UserService";
// reuse the form styles used by the plan add-topic form
import "./AddTopic.scss";
import { FiPlus, FiTrash2, FiPaperclip } from "react-icons/fi";

const AddTopic = ({
  classId,
  groupId,
  token,
  dispatch,
  disabled,
  open: openProp,
  setOpen: setOpenProp,
}) => {
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

  // find group object from classes in redux so we can check group leader
  const classesRaw = useSelector((state) => state.class?.classes || []);
  const groupObj = useMemo(() => {
    if (!groupId) return null;
    for (const cls of classesRaw || []) {
      const g = (cls.groups || []).find((gr) => String(gr.groupsId) === String(groupId));
      if (g) return { ...g, classId: cls.classesId, className: cls.classesName };
    }
    return null;
  }, [classesRaw, groupId]);

  const isLeader = !!groupObj && String(groupObj.groupsLeaderId) === String(userId);

  const { getUserById } = userApi();
  const [leaderName, setLeaderName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const leaderId = groupObj?.groupsLeaderId;
        if (!leaderId || !token) return;
        const name = await getUserById(token, leaderId);
        if (cancelled) return;
        // getUserById returns user object; try common name fields
        const display = name?.full_name || name?.fullName || name?.work_id || leaderId;
        setLeaderName(display);
      } catch (e) {
        if (cancelled) return;
        setLeaderName(groupObj?.groupsLeaderId || null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupObj, token, getUserById]);

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
  if (!classId || !groupId) return "Missing classId or groupId.";
  if (!isLeader) return "Only the group leader can register a topic.";
  if (!form.topicTitle.trim()) return "Please enter topic title.";
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
        allowEdit: true,
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
      setError("Failed to add topic");
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
          aria-label="Close"
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
              placeholder="Topic title *"
              value={form.topicTitle}
              onChange={handleChange}
              required
              className="sl-input"
              disabled={loading || !isLeader}
            />
            <input
              name="topicAbbreviation"
              placeholder="Abbreviation (optional)"
              value={form.topicAbbreviation}
              onChange={handleChange}
              className="sl-input"
              disabled={loading || !isLeader}
            />
            <textarea
              name="topicDescription"
              placeholder="Description"
              value={form.topicDescription}
              onChange={handleChange}
              className="sl-textarea"
              disabled={loading || !isLeader}
            />
            <textarea
              name="topicObjective"
              placeholder="Objectives"
              value={form.topicObjective}
              onChange={handleChange}
              className="sl-textarea"
              disabled={loading || !isLeader}
            />

            <div className="sl-upload">
              <label className="sl-label">Attachments</label>
              <div className="sl-upload__row">
                <label className="sl-btn sl-btn--ghost">
                  <FiPaperclip />
                  Select files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading || !isLeader}
                    hidden
                  />
                </label>
                <div className="sl-upload__hint">
                  Multiple files supported. For large files, use a Drive link.
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
                        View
                      </a>
                      <button
                        type="button"
                        className="sl-chip__remove"
                        onClick={() => removeAttachment(idx)}
                        disabled={loading}
                        aria-label={`Remove ${att.fileName}`}
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

          {!isLeader && (
            <div className="sl-alert sl-alert--warning" role="alert">
              Only the group leader ({leaderName || groupObj?.groupsLeaderId || '—'}) can add a topic.
            </div>
          )}

          <div className="sl-actions sl-actions--center">
            <button
              type="submit"
              className="sl-btn sl-btn--primary"
              disabled={loading || disabled || !isLeader}
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="sl-btn sl-btn--ghost"
              onClick={() => !loading && setOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTopic;
