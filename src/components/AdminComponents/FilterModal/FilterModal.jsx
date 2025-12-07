import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./FilterModal.scss";

const FilterModal = ({
  isOpen,
  onClose,
  anchorRef,
  filters = [],
  role,
  selectedFilters = [],
  onFilterChange,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !anchorRef?.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();

  const handleCheckboxChange = (value) => {
    onFilterChange(value);
  };

  const handleCancel = () => {
    selectedFilters.forEach((value) => onFilterChange(value));

    onClose();
  };

  const handleClearAll = () => {
    setTimeout(() => {
      selectedFilters.forEach((val) => {
        if (selectedFilters.includes(val)) {
          onFilterChange(val);
        }
      });
    }, 0);
    onClose();
  };

  return createPortal(
    <div
      className="filter-modal"
      ref={modalRef}
      style={{
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: 340,
      }}
    >
      <div className="filter-modal__header">
        <h3>Filter {role}</h3>
      </div>

      <div className="filter-modal__body">
        {filters.length === 0 ? (
          <p className="no-filter-text">Filters aren't available!</p>
        ) : (
          <div className="filter-group">
            <div className="filter-group__options">
              {filters.map((item) => (
                <label key={item.id} className="filter-option">
                  <input
                    type="checkbox"
                    value={item.value}
                    checked={selectedFilters.includes(item.value)}
                    onChange={() => handleCheckboxChange(item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="filter-modal__footer">
        <button onClick={handleCancel} className="btn-cancel">
          Cancel (delete filter)
        </button>
      </div>
    </div>,
    document.body
  );
};

export default FilterModal;
