import { useState } from "react";
import "./SlotModal.scss";

const Modal = ({ event, onClose, onDelete, onEdit, onUpdate, canDelete = false }) => {
  const [title, setTitle] = useState(event.title);
  const parseAsLocal = (iso) => {
    if (!iso) return null;
    if (iso instanceof Date) return iso;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) {
      const [, Y, Mo, D, H, Mi, S] = m;
      return new Date(Number(Y), Number(Mo) - 1, Number(D), Number(H), Number(Mi), Number(S || 0));
    }
    return new Date(iso);
  };

  const toInputValue = (d) => {
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const [start, setStart] = useState(toInputValue(parseAsLocal(event.start)));
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...event,
      title,
      start: new Date(start),
      end: event.end ? event.end : null,
    });
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Details</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="modal-field">
            <label>From:</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={!isEditing}
            />
          </div>

        </div>

        <div className="modal-actions">
          {!isEditing ? (
            <>
              <button className="edit" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              {canDelete ? (
                <button className="delete" onClick={onDelete}>
                  Delete
                </button>
              ) : null}
              <button className="close" onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <button className="save" onClick={handleSave}>
                💾 Save
              </button>
              <button className="close" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
