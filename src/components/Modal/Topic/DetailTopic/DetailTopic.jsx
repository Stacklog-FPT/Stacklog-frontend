import React, { useRef, useEffect, useState } from "react";
import "./DetailTopic.scss";
import { FiX, FiCheckCircle, FiXCircle, FiPaperclip } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider";
import userApi from "../../../../service/UserService";
import decodeToken from "../../../../service/DecodeJwt";
import { fetchUserById } from "../../../../service/UserService";

const DetailTopic = ({
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
    attachments: topic?.attachments ? [...topic.attachments] : [],
  });

  const [localTopic, setLocalTopic] = React.useState(topic);
  const { user } = useAuth();
  const token = user?.token;
  const [leaderName, setLeaderName] = useState(null);
  const [memberNames, setMemberNames] = useState([]);
  const [leaderAvatar, setLeaderAvatar] = useState(null);
  const [memberAvatars, setMemberAvatars] = useState([]);

  React.useEffect(() => {
    setLocalTopic(topic);
  }, [topic]);

  let currentUserId = user?.id || user?.username || "";
  if (token) {
    const decoded = decodeToken(token);
    currentUserId = decoded?.id || currentUserId;
  }

  useEffect(() => {
    let cancelled = false;
    const fetchNames = async () => {
      if (!group) {
        setLeaderName(null);
        setMemberNames([]);
        setLeaderAvatar(null);
        setMemberAvatars([]);
        return;
      }

      const leaderId = group.groupsLeaderId || group.groupsLeader || null;
      const rawMembers = group.groupStudent || group.groupStudents || [];
      const memberIds = rawMembers
        .map((m) => (typeof m === "string" ? m : m.userId || m.id || ""))
        .filter(Boolean);

      if (leaderId) {
        try {
          const u = await fetchUserById(token, leaderId);
          if (!cancelled) {
            setLeaderName(
              u?.full_name || u?.work_id || leaderId
            );
            setLeaderAvatar(u?.avatar_link || null);
          }
        } catch {
          if (!cancelled) {
            setLeaderName(leaderId);
            setLeaderAvatar(null);
          }
        }
      } else {
        setLeaderName(null);
        setLeaderAvatar(null);
      }

      if (memberIds.length > 0) {
        const results = await Promise.all(
          memberIds.map(async (id) => {
            try {
              const u = await fetchUserById(token, id);
              return {
                name: u?.full_name || u?.work_id || id,
                avatar: u?.avatar_link || null
              };
            } catch {
              return { name: id, avatar: null };
            }
          })
        );
        if (!cancelled) {
          setMemberNames(results.map(r => r.name));
          setMemberAvatars(results.map(r => r.avatar));
        }
      } else {
        setMemberNames([]);
        setMemberAvatars([]);
      }
    };
    fetchNames();
    return () => {
      cancelled = true;
    };
  }, [group, token]);

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

  const status = (localTopic && localTopic.status) || topic?.status;

  const canAct =
    role === "LECTURER" && (status === "Pending" || status === "Rejected");

  const canGrantEdit = role === "LECTURER" && status === "Accepted";

  const isLeader =
    !!group &&
    (String(group.groupsLeaderId) === String(currentUserId) ||
      String(group.groupsLeader) === String(currentUserId));
  const canEdit =
    role === "STUDENT" &&
    !!isLeader &&
    localTopic &&
    (localTopic?.status === "Rejected" ||
      (localTopic?.status === "Pending" && localTopic?.allowEdit === true) ||
      (localTopic?.status === "Accepted" && localTopic?.allowEdit === true));

  const handleGrant = () => {
    if (!onUpdate) return;

    setLocalTopic((t) => ({ ...t, allowEdit: true, status: "Pending" }));
    onUpdate(topic.topicId, { allowEdit: true, status: "Pending" });
  };

  const handleApprove = () => {
    if (!onApprove) return;

    setLocalTopic((t) => ({
      ...t,
      status: "Accepted",
      allowEdit: false,
      rejectReason:
        rejectReason && rejectReason.trim()
          ? rejectReason.trim()
          : t.rejectReason,
    }));
    onApprove(topic.topicId);
  };

  const handleReject = () => {
    if (!onReject) return;

    if (!rejectReason || !rejectReason.trim()) {
      setLocalError && setLocalError("Please enter a rejection reason");
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

    // When student edits topic, reset status to Pending
    const updatedData = { 
      ...editForm, 
      status: "Pending",
      allowEdit: false 
    };
    
    setLocalTopic((t) => ({ ...t, ...updatedData }));
    setEditMode(false);
    onUpdate(topic.topicId, updatedData);
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
          aria-label="Close"
          disabled={actionLoading}
        >
          <FiX />
        </button>

        <h3 className="sl-modal__title">
          Group <span>{group?.groupsName || "-"}</span> – Class{" "}
          {group?.className || "-"}
        </h3>

        <div className="sl-grid">
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Leader</div>
            <div className="sl-user-info">
              <div className="sl-avatar">
                {leaderAvatar ? (
                  <img src={leaderAvatar} alt="Leader" />
                ) : (
                  leaderName?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <span>{leaderName || group?.groupsLeaderId || "-"}</span>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Members</div>
            {memberNames && memberNames.length > 0 ? (
              <div className="sl-members-list">
                {memberNames.map((name, idx) => (
                  <div key={idx} className="sl-member-item">
                    <div className="sl-avatar sl-avatar--sm">
                      {memberAvatars[idx] ? (
                        <img src={memberAvatars[idx]} alt={name} />
                      ) : (
                        name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sl-muted">-</div>
            )}
          </div>

          <div className="sl-field-inline">
            <div className="sl-label">Topic title</div>
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

          <div className="sl-field-inline">
            <div className="sl-label">Abbreviation</div>
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
            <div className="sl-label">Description</div>
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

          {/* objective removed */}

          <div className="sl-field-inline">
            <div className="sl-label">Registered at</div>
            <div>
              {topic.registerAt
                ? new Date(topic.registerAt).toLocaleDateString()
                : "-"}
            </div>
          </div>

          <div>
            <div className="sl-label sl-field-inline">Deadline</div>
            <div
              className={`sl-badge sl-badge--${(
                topic.status || ""
              ).toLowerCase()}`}
            >
              {topic.status}
            </div>
            {localTopic?.allowEdit && localTopic?.status === "Pending" && (
              <div className="sl-hint">Edit access granted to students</div>
            )}
          </div>

          <div>
            <div className="sl-label sl-field-inline">Status</div>
            <div
              className={`sl-badge sl-badge--${(
                topic.status || ""
              ).toLowerCase()}`}
            >
              {topic.status}
            </div>
            {localTopic?.allowEdit && localTopic?.status === "Pending" && (
              <div className="sl-hint">Edit access granted to students</div>
            )}
          </div>

          {/* <div style={{ gridColumn: "1 / -1" }}>
            <div className="sl-label">Attachments</div>
            {editMode ? (
              <>
                <label className="sl-btn sl-btn--ghost">
                  <FiPaperclip /> Select files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={actionLoading}
                    hidden
                  />
                </label>
                <div className="sl-upload__hint">
                  Multiple files supported. For large files, use a Drive link.
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
                          View
                        </a>
                        <button
                          type="button"
                          className="sl-chip__remove"
                          onClick={() => removeAttachment(idx)}
                          disabled={actionLoading}
                          aria-label={`Remove ${att.fileName}`}
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
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="sl-muted">None</div>
            )}
          </div> */}

          {(topic.status === "Rejected" || topic.status === "Accepted") &&
            topic.rejectReason && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="sl-label">
                  {topic.status === "Rejected"
                    ? "Reject reason"
                    : "Approval note"}
                </div>
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
              Grant edit permissions
            </button>
          </div>
        )}

        {/* === LECTURER: Duyệt/Từ chối khi Pending & chưa mở quyền cho SV === */}
        {canAct && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--success"
              style={{ background: "#045745" }}
              disabled={actionLoading}
              onClick={handleApprove}
            >
              <FiCheckCircle />
              Accepted
            </button>
            <button
              className="sl-btn sl-btn--danger"
              disabled={actionLoading}
              onClick={handleReject}
            >
              <FiXCircle />
              Reject
            </button>
            <input
              type="text"
              className="sl-input sl-input--inline"
              placeholder="Enter reason…"
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
            You currently <b>do not have permission</b> to update/delete this
            topic. Please contact the instructor to request access.
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
              Edit
            </button>
            <button
              className="sl-btn sl-btn--danger"
              disabled={actionLoading}
              onClick={() => onDelete && onDelete(topic.topicId)}
            >
              Delete
            </button>
          </div>
        )}

        {/* === STUDENT: Đang chỉnh sửa === */}
        {canEdit && editMode && (
          <div className="sl-actions">
            <button
              className="sl-btn sl-btn--success"
              style={{ background: "#045745" }}
              disabled={actionLoading}
              onClick={handleSaveEdit}
            >
              Save changes
            </button>
            <button
              className="sl-btn sl-btn--ghost"
              disabled={actionLoading}
              onClick={() => setEditMode(false)}
            >
              Cancel
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

export default DetailTopic;
