import React from 'react';
import './SubTask.scss';
import { formatDateUI } from '../../../../helper/formatDate';
const SubTask = (data = []) => {
  const timePercent = (start, due) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(due);
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    const total = e - s;
    const passed = Math.min(Math.max(now - s, 0), total);
    return Math.round((passed / total) * 100);
  };
  return (
    <div className="subtask__container compact">
      {data.data?.length > 0 ? (
        data.data?.map((item) => {
          const percent = timePercent(item.taskStartTime, item.taskDueDate);
          const priority = String(item.priority || 'NORMAL').toLowerCase();

          return (
            <div className="subtask__card" key={item.taskId}>
              {/* header */}
              <div className="st__head">
                <span className={`st__priority st__priority--${priority}`}>
                  {item.priority || 'NORMAL'}
                </span>
                <h4 className="st__title" title={item.taskTitle}>
                  {item.taskTitle || 'Untitled subtask'}
                </h4>
              </div>

              {/* meta */}
              <div className="st__meta">
                <div className="st__meta__item">
                  <span className="label">Start</span>
                  <span className="value">{formatDateUI(item.taskStartTime)}</span>
                </div>
                <div className="st__meta__item">
                  <span className="label">Due</span>
                  <span className="value">{formatDateUI(item.taskDueDate)}</span>
                </div>
                {/* <div className="st__meta__item st__meta__assignees">
                  <span className="label">Assignees</span>
                  <div className="st__avatars" title={(item.assignTo || []).join(', ')}>
                    {(item.assignTo || [])
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((u, i) => (
                        <span className="st__avatar" key={`${u}-${i}`}>
                          {getInitials(u)}
                        </span>
                      ))}
                    {(item.assignTo || []).filter(Boolean).length > 3 && (
                      <span className="st__avatar st__avatar--more">
                        +{(item.assignTo || []).filter(Boolean).length - 3}
                      </span>
                    )}
                  </div>
                </div> */}
              </div>

              {/* progress */}
              <div className="st__footer">
                <div className="st__progress" aria-label="time progress">
                  <div className="st__progress__bar">
                    <div
                      className={`st__progress__fill ${
                        percent >= 70 ? 'ok' : percent >= 40 ? 'warn' : 'alert'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="st__progress__label">{percent}%</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <h2 className="list__empty">No data available</h2>
      )}
    </div>
  );
};

export default SubTask;
