import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ModalAITaskItem({ task, selected = false, onSelect }) {
  if (!task) return null;

  const {
    taskId,
    taskTitle,
    taskDescription,
    taskStartTime,
    taskDueDate,
    priority,
    taskPoint,
  } = task;

  const shortDesc = taskDescription
    ? taskDescription.length > 160
      ? `${taskDescription.slice(0, 157)}...`
      : taskDescription
    : '';

  const id = taskId || task.TaskId || task.id || '';
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const itemRef = useRef(null);

  useEffect(() => {
    if (showTooltip && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const tooltipWidth = 380;
      const tooltipHeight = 500;
      const gap = 12;
      const padding = 10;
      
      // Calculate position relative to viewport
      let left = rect.right + gap;
      let top = rect.top;
      
      // If tooltip would go off-screen on the right, show on left
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = rect.left - tooltipWidth - gap;
        // If still off-screen on left, align to left edge
        if (left < padding) {
          left = padding;
        }
      }
      
      // Keep tooltip within viewport vertically
      if (top + tooltipHeight > window.innerHeight - padding) {
        top = window.innerHeight - tooltipHeight - padding;
      }
      if (top < padding) {
        top = padding;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [showTooltip]);

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(task);
  };

  return (
    <>
    <div
      ref={itemRef}
      className={`modal-ai-task-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect && onSelect(task); }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="modal-ai-task-left">
        <label className="modal-ai-task-select">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
          />
          <span className="modal-ai-checkbox-fake" />
        </label>
      </div>

      <div className="modal-ai-task-main">
        <div className="modal-ai-task-row">
          <div className="modal-ai-task-title">{taskTitle || 'Untitled task'}</div>
          <div className="modal-ai-task-meta">
            {/** map priority to class names for styling */}
            {(() => {
              const p = (priority || '').toString().trim().toLowerCase();
              let cls = '';
              if (p === 'high' || p === 'h' || p === 'urgent') cls = 'priority-high';
              else if (p === 'medium' || p === 'med' || p === 'm') cls = 'priority-medium';
              else if (p === 'low' || p === 'l') cls = 'priority-low';
              else if (p === 'critical') cls = 'priority-critical';
              else cls = 'priority-default';
              return (
                <div className="modal-ai-task-meta-inner">
                  <div className={`modal-ai-priority ${cls}`}>{priority || '—'}</div>
                  <div className="modal-ai-points">{taskPoint ? `${taskPoint} pts` : ''}</div>
                </div>
              );
            })()}
          </div>
        </div>
        <div className="modal-ai-task-sub">
          <div className="modal-ai-task-desc">{shortDesc}</div>
        </div>

        <div className="modal-ai-task-footer">
          {/* <span className="modal-ai-badge">{id}</span> */}
          <div className="modal-ai-dates">Start: {taskStartTime || '-'} &nbsp; Due: {taskDueDate || '-'}</div>
        </div>
      </div>
    </div>

    {/* Tooltip rendered via portal to avoid overflow issues */}
    {showTooltip && typeof document !== 'undefined' && createPortal(
      <div 
        className="modal-ai-task-tooltip-portal" 
        style={{ 
          position: 'fixed', 
          top: `${tooltipPosition.top}px`, 
          left: `${tooltipPosition.left}px`,
          zIndex: 99999 
        }}
      >
        <div className="modal-ai-tooltip-header">
          <span className="modal-ai-tooltip-title">{taskTitle || 'Untitled task'}</span>
          {id && <span className="modal-ai-tooltip-id">#{id}</span>}
        </div>
        
        <div className="modal-ai-tooltip-section">
          <strong>Description:</strong>
          <p>{taskDescription || 'No description provided'}</p>
        </div>

        <div className="modal-ai-tooltip-grid">
          <div className="modal-ai-tooltip-item">
            <strong>Priority:</strong>
            <span className={`modal-ai-tooltip-priority priority-${(priority || '').toLowerCase()}`}>
              {priority || 'Not set'}
            </span>
          </div>
          
          <div className="modal-ai-tooltip-item">
            <strong>Points:</strong>
            <span>{taskPoint !== null && taskPoint !== undefined ? taskPoint : 'Not set'}</span>
          </div>
        </div>

        <div className="modal-ai-tooltip-grid">
          <div className="modal-ai-tooltip-item">
            <strong>Start Date:</strong>
            <span>{taskStartTime || 'Not set'}</span>
          </div>
          
          <div className="modal-ai-tooltip-item">
            <strong>Due Date:</strong>
            <span>{taskDueDate || 'Not set'}</span>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
