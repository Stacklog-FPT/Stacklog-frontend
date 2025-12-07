import React from 'react';

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

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(task);
  };

  return (
    <div
      className={`modal-ai-task-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect && onSelect(task); }}
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
  );
}
