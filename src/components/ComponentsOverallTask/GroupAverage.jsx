import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createAvgGroupScore } from '../../service/ScoreService';
import { useAuth } from '../../context/AuthProvider';
import { useDispatch } from 'react-redux';
import avatarDefault from '../../assets/ava-chat.png';
import Swal from 'sweetalert2';

export default function GroupAverage({ initialScore, groupId, token, onUpdate, classId, memberContribution: propsMemberContribution, usersMap: propsUsersMap }) {
  const [score, setScore] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalScore, setModalScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]);

  useEffect(() => {
    if (typeof initialScore !== 'undefined' && initialScore !== null) {
      setScore(Number(initialScore));
    } else {
      setScore(null);
    }
  }, [initialScore]);

  const handleSave = async () => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to save the score'
      });
      return;
    }
    if (modalScore === null || isNaN(modalScore)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Score',
        text: 'Please enter a valid score'
      });
      return;
    }
    if (modalScore < 0 || modalScore > 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Range',
        text: 'Score must be between 0 and 10'
      });
      return;
    }
    if (!classId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Missing class information. Please wait and try again.'
      });
      return;
    }

    // Hỏi xác nhận lại trước khi lưu
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Score',
      text: `Are you sure you want to save the average score as ${Number(modalScore).toFixed(2)}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, save it',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'swal-high-zindex'
      },
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '99999';
        }
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    setSaving(true);
    try {
      await createAvgGroupScore(classId, groupId, Number(modalScore), token, dispatch);
      // update parent computed values
      if (typeof onUpdate === 'function') onUpdate(modalScore);
      setShowEditModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Average score saved successfully'
      });
    } catch (err) {
      console.error('Failed to save avg group score (direct save)', err);
      console.error('Request config:', err?.config);
      console.error('Response:', err?.response && { status: err.response.status, data: err.response.data });
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save average score: ' + (serverMsg || 'Unknown')
      });
    } finally {
      setSaving(false);
    }
  };

  // live-preview: compute preview list whenever modalScore (or member contributions) change
  useEffect(() => {
    if (modalScore === null || typeof modalScore === 'undefined' || isNaN(modalScore)) {
      setPreviewList([]);
      return;
    }
    // validate range
    if (modalScore < 0 || modalScore > 10) {
      setPreviewList([]);
      return;
    }
    try {
      const memberContrib = (propsMemberContribution) || {};
      const memberIds = Object.keys(memberContrib);
      const totalMembers = memberIds.length || 1;
      const preview = memberIds.map((uid) => {
        const contribPercent = Number(memberContrib[uid]) || 0;
        const computed = (Number(modalScore) * contribPercent) / (100 / totalMembers);
        const capped = Math.min(10, computed);
        return {
          uid,
          name: (propsUsersMap && propsUsersMap[uid] && propsUsersMap[uid].full_name) || uid,
          contribution: contribPercent,
          computed: Number(Number(capped).toFixed(2)),
        };
      });
      setPreviewList(preview);
    } catch (e) {
      setPreviewList([]);
    }
  }, [modalScore, propsMemberContribution, propsUsersMap]);

  const handleConfirm = async () => {
    // call backend createAvgGroupScore
    if (!classId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Missing classId to save average score'
      });
      return;
    }
    try {
      setSaving(true);
      // pass redux dispatch so service can emit apiStart/apiSuccess/apiFailure if desired
      await createAvgGroupScore(classId, groupId, Number(modalScore), token, dispatch);
      // notify parent to update computed values
      if (typeof onUpdate === 'function') onUpdate(modalScore);
      setPreviewOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Average score saved successfully'
      });
    } catch (err) {
      // richer logging to help diagnose 404/other HTTP errors
      console.error('Failed to create avg group score', err);
      console.error('Request config:', err?.config);
      console.error('Response:', err?.response && { status: err.response.status, data: err.response.data });
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save average score: ' + (serverMsg || 'Unknown')
      });
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
            {user?.role === 'LECTURER' && score !== null && Number(score) === 0 && (
              <button
                className="group-score-save"
                onClick={async () => {
                  if (!classId) {
                    // classId not yet resolved by parent; show helpful message instead of opening modal
                    Swal.fire({
                      icon: 'warning',
                      title: 'Not Ready',
                      text: 'Class information still resolving. Please wait a moment and try again.'
                    });
                    return;
                  }
                  const result = await Swal.fire({
                    icon: 'question',
                    title: 'Confirm Entry',
                    text: 'Do you want to enter the group average score?',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel'
                  });
                  if (result.isConfirmed) {
                    setModalScore(score);
                    setShowEditModal(true);
                  }
                }}
                // visually indicate the button is disabled when classId is missing
                disabled={!classId}
                title={!classId ? 'Class info not available yet' : 'Enter group average score'}
              >
                Scoring
              </button>
            )}
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
                  {/* Inline live preview while typing */}
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ display: 'block', marginBottom: 8 }}>Live preview</strong>
                    {previewList && previewList.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {previewList.map((p) => (
                          <div key={p.uid} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, background: '#fff', border: '1px solid #eee', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={(propsUsersMap && propsUsersMap[p.uid] && propsUsersMap[p.uid].avatar) || avatarDefault}
                                alt={p.name}
                                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,0.03) inset' }}
                              />
                              <div style={{ color: '#333' }}>{p.name}</div>
                            </div>
                            <div style={{ fontWeight: 600 }}>{p.computed}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#666' }}>No preview available</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 12, lineHeight: '1.4' }}>
                  <strong style={{ display: 'block', marginBottom: 6, color: '#374151' }}>Note</strong>
                  <div>
                    The maximum score for a member is <strong>10</strong>. If the score is higher than 10, the system automatically reduces it to 10. Therefore, the final group average might be lower than the figure the instructor just entered.
                  </div>
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
                    {saving ? 'Confirm...' : 'Comfirm'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
      {previewOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="overallgroup-modal-overlay"
              role="dialog"
              aria-modal="true"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setPreviewOpen(false);
              }}
            >
              <div className="overallgroup-modal" role="document">
                <div className="overallgroup-modal-header">
                  <h4>Preview computed member scores</h4>
                </div>
                <div className="overallgroup-modal-body">
                  {previewList && previewList.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {previewList.map((p) => (
                        <div key={p.uid} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={(propsUsersMap && propsUsersMap[p.uid] && propsUsersMap[p.uid].avatar) || avatarDefault}
                              alt={p.name}
                              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>{p.name}</div>
                          </div>
                          <div style={{ fontWeight: 600 }}>{p.computed}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>No member contributions available to compute.</div>
                  )}
                </div>
                <div className="overallgroup-modal-actions">
                  <button className="overallgroup-modal-btn overallgroup-modal-cancel" onClick={() => setPreviewOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="overallgroup-modal-btn overallgroup-modal-save"
                    onClick={handleConfirm}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Confirm'}
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
