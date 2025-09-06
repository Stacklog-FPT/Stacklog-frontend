import React from "react";
import "./PopupCreateClass.scss";

const PopupCreateClass = ({
  newClassName,
  setNewClassName,
  handleCreateClass,
  isCreating,
  setShowCreateClass,
}) => (
  <div className="popup-create-class">
    <div className="popup-content">
      <h3>Create new class</h3>
      <input
        type="text"
        placeholder="Enter class name..."
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
      />
      <div className="popup-actions">
        <button
          onClick={handleCreateClass}
          disabled={isCreating || !newClassName.trim()}
          className="btn-confirm"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
        <button
          onClick={() => setShowCreateClass(false)}
          className="btn-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default PopupCreateClass;
