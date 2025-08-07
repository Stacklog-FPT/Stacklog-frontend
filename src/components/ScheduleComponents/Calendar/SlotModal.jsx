import { useState } from "react";
import "./SlotModal.scss";

const Modal = ({ event, onClose, onDelete, onEdit, onUpdate }) => {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start.toISOString().slice(0, 16)); 
  const [end, setEnd] = useState(event.end.toISOString().slice(0, 16));
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...event,
      title,
      start: new Date(start),
      end: new Date(end),
    });
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Slot Details</h2>
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

          <div className="modal-field">
            <label>To:</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
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
              <button className="delete" onClick={onDelete}>
                Delete
              </button>
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
