import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { updateGroupScore } from '../../service/TaskService';

export default function GroupAverage({ initialScore, groupId, token, onUpdate }) {
  const [score, setScore] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalScore, setModalScore] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof initialScore !== 'undefined' && initialScore !== null) {
      setScore(Number(initialScore));
    } else {
      setScore(null);
    }
  }, [initialScore]);

  const handleSave = async () => {
    if (!token) return alert('Please log in to save the score');
    if (modalScore === null || isNaN(modalScore)) return alert('Please enter a valid score');
    if (modalScore < 0 || modalScore > 10) return alert('Score must be between 0 and 10');
    setSaving(true);
    try {
      await updateGroupScore(token, groupId, modalScore);
      setScore(modalScore);
      if (typeof onUpdate === 'function') onUpdate(modalScore);
      setShowEditModal(false);
      alert('Score saved successfully');
    } catch (err) {
      console.error('Failed to save group score', err);
      alert('Failed to save score: ' + (err?.message || 'Unknown'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group-score-card chart-card">
      <div className="chart-header">
        <h3>Group average score</h3>
      </div>
      <div className="group-score-body">
        <div className="group-score-left">
          <div className="group-score-value" aria-hidden>
            {score !== null && typeof score !== 'undefined' ? Number(score).toFixed(2) : '—'}
          </div>
          <div className="group-score-progress" aria-hidden>
            <div
              className="group-score-progress__fill"
              style={{ width: `${Math.max(0, Math.min(10, score || 0)) * 10}%` }}
            />
          </div>
        </div>

        <div className="group-score-right">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              className="group-score-save"
              onClick={() => {
                setModalScore(score);
                setShowEditModal(true);
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {showEditModal && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="overallgroup-modal-overlay"
              role="dialog"
              aria-modal="true"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowEditModal(false);
              }}
            >
              <div className="overallgroup-modal" role="document">
                <div className="overallgroup-modal-header">
                  <h4>Edit group average score</h4>
                </div>
                <div className="overallgroup-modal-body">
                  <label className="group-score-label">Score (0 - 10)</label>
                  <input
                    className="group-score-input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={modalScore === null || typeof modalScore === 'undefined' ? '' : modalScore}
                    onChange={(e) => setModalScore(e.target.value === '' ? null : Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave();
                      } else if (e.key === 'Escape') {
                        setShowEditModal(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="overallgroup-modal-actions">
                  <button className="overallgroup-modal-btn overallgroup-modal-cancel" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="overallgroup-modal-btn overallgroup-modal-save"
                    onClick={handleSave}
                    disabled={saving || modalScore === score}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
