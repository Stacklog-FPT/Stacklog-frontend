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
      <h3>Tạo lớp mới</h3>
      <input
        type="text"
        placeholder="Nhập tên lớp..."
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
      />
      <div className="popup-actions">
        <button
          onClick={handleCreateClass}
          disabled={isCreating || !newClassName.trim()}
          className="btn-confirm"
        >
          {isCreating ? "Đang tạo..." : "Tạo"}
        </button>
        <button
          onClick={() => setShowCreateClass(false)}
          className="btn-cancel"
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
);

export default PopupCreateClass;