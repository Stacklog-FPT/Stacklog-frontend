import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ModalAI.scss';
import { postAiTaskAndDispatch } from '../../service/AiService';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthProvider';

export default function ModalAI({ placement = 'bottom-right' }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('single'); // 'single' | 'list'

  // form fields for single task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  // default Start date to today (YYYY-MM-DD)
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().slice(0, 10) : '';
  const [taskStartTime, setTaskStartTime] = useState(todayStr);
  const [taskDueDate, setTaskDueDate] = useState(todayStr);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityRef = useRef(null);
  const [listPriority, setListPriority] = useState('LOW');
  const [listDueDate, setListDueDate] = useState(todayStr);
  const [showListPriorityDropdown, setShowListPriorityDropdown] = useState(false);
  const listPriorityRef = useRef(null);
  const dispatch = useDispatch();

 

  // for list template
  const [listCount, setListCount] = useState(1);
  const [generatedJson, setGeneratedJson] = useState('');

  useEffect(() => {
    const onDocClick = (e) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setShowPriorityDropdown(false);
      }
      if (listPriorityRef.current && !listPriorityRef.current.contains(e.target)) {
        setShowListPriorityDropdown(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowPriorityDropdown(false);
        setShowListPriorityDropdown(false);
      }
    };
    if (showPriorityDropdown || showListPriorityDropdown) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showPriorityDropdown, showListPriorityDropdown]);
  const handleSend = async () => {
    if (!query || query.trim() === '') return;
    // Fake local response for now — wiring to an AI backend can be added later
    setLoading(true);
    try {
      const prompt = query.trim();
      // push user query
      setHistory((h) => [...h, { from: 'user', text: prompt }]);
      // simulate response
      await new Promise((r) => setTimeout(r, 700));
      setHistory((h) => [...h, { from: 'ai', text: `Auto-reply to: "${prompt}"` }]);
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  const buildSingleTask = () => {
    // include both app-friendly keys and some common API keys (mapping)
    const obj = {
      Title: taskTitle || null,
      Description: taskDescription || null,
      Priority: priority || '',
      StartTime: taskStartTime || '',
      DueDate: taskDueDate || '',
    };
    return obj;
  };

  const buildListTemplate = () => {
    const arr = [];
    for (let i = 0; i < Math.max(1, Number(listCount || 1)); i++) {
      arr.push({
        Title: null,
        Description: null,
        Priority: listPriority || '',
        StartTime: todayStr,
        DueDate: listDueDate || todayStr,
      });
    }
    return arr;
  };

  const handleGenerate = async () => {
    if (mode === 'single') {
      const body = {
        taskTitle: taskTitle || '',
        taskDescription: taskDescription || '',
        priority: priority || '',
        taskDueDate: taskDueDate || '',
      };

      setLoading(true);
      try {
        // use the title entered by the user as the API path (fallback to 'task')
        const apiTitle = (taskTitle && String(taskTitle).trim()) || 'task';
        const data = await postAiTaskAndDispatch({ title: apiTitle, payload: body, token: user?.token, dispatch });
        setGeneratedJson(JSON.stringify(data, null, 2));
        setHistory((h) => [...h, { from: 'ai', text: `AI response received (${Array.isArray(data) ? data.length : 1} items)` }]);
      } catch (err) {
        setHistory((h) => [...h, { from: 'ai', text: `AI request failed: ${err?.response?.data || err.message || 'Unknown error'}` }]);
      } finally {
        setLoading(false);
      }
    } else {
      const arr = buildListTemplate();
      setGeneratedJson(JSON.stringify(arr, null, 2));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedJson || '');
      setHistory((h) => [...h, { from: 'ai', text: 'JSON copied to clipboard' }]);
    } catch (e) {
      setHistory((h) => [...h, { from: 'ai', text: 'Copy failed' }]);
    }
  };

  const handleConfirm = async () => {
    // ensure we have generated JSON to confirm
    let json = generatedJson;
    if (!json) {
      if (mode === 'single') json = JSON.stringify(buildSingleTask(), null, 2);
      else json = JSON.stringify(buildListTemplate(), null, 2);
      setGeneratedJson(json);
    }
    try {
      await navigator.clipboard.writeText(json || '');
      setHistory((h) => [...h, { from: 'ai', text: 'Confirmed: JSON copied to clipboard' }]);
      // close modal after confirm
      setOpen(false);
    } catch (e) {
      setHistory((h) => [...h, { from: 'ai', text: 'Confirm failed to copy' }]);
    }
  };

  const handleCancel = () => {
    // simply close modal without taking action
    setOpen(false);
  };

  const handleClear = () => {
    // clear history, generated JSON and reset form fields (mapping)
    setHistory([]);
    setGeneratedJson('');
    setTaskTitle('');
    setTaskDescription('');
    setPriority('LOW');
    setTaskStartTime(todayStr);
    setTaskDueDate(todayStr);
    setListCount(1);
  };

  return (
    <>
      <div className={`modal-ai-fab modal-ai-${placement}`}>
        <button
          className="modal-ai-fab-btn"
          aria-label="Open AI Assistant"
          onClick={() => setOpen(true)}
          title="AI Agents"
        >
        <i className="fa-solid fa-robot" style={{marginRight: 4}}></i>
        AI
        </button>
      </div>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="modal-ai-overlay" role="dialog" aria-modal="true">
              <div className="modal-ai-box">
                <div className="modal-ai-header">
                  <h4>AI Agents</h4>
                  <div className="modal-ai-actions">
                    <button className="modal-ai-close" onClick={() => setOpen(false)} title="Close">✕</button>
                  </div>
                </div>

                <div className="modal-ai-body">
                  <div className="modal-ai-tabs">
                    <button
                      className={`modal-ai-tab ${mode === 'single' ? 'active' : ''}`}
                      onClick={() => setMode('single')}
                    >
                      Single task
                    </button>
                    <button
                      className={`modal-ai-tab ${mode === 'list' ? 'active' : ''}`}
                      onClick={() => setMode('list')}
                    >
                      Task list template
                    </button>
                    <div style={{ flex: 1 }} />
                    <button className="modal-ai-clear" onClick={handleClear}>
                      Clear
                    </button>
                  </div>

                  {mode === 'single' ? (
                    <div className="modal-ai-form">
                      <label>Title</label>
                      <input placeholder="Enter task title" className="modal-ai-input" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                      <label>Description</label>
                      <textarea
                        placeholder="Enter task description"
                        className="modal-ai-textarea"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label>Priority</label>
                          <div className="modal-ai-priority-select" ref={priorityRef}>
                            <button type="button" className="modal-ai-priority-btn" onClick={() => setShowPriorityDropdown((s) => !s)}>
                              <span className={`modal-ai-priority-dot modal-ai-priority-${priority.toLowerCase()}`} />
                              <span style={{ marginLeft: 8 }}>{priority || 'Select'}</span>
                              <span style={{ marginLeft: 8, opacity: 0.6 }}>▾</span>
                            </button>
                            {showPriorityDropdown && (
                              <div className="modal-ai-priority-dropdown">
                                <div className="modal-ai-priority-item" onClick={() => { setPriority('HIGH'); setShowPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-high" /> HIGH
                                </div>
                                <div className="modal-ai-priority-item" onClick={() => { setPriority('MEDIUM'); setShowPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-medium" /> MEDIUM
                                </div>
                                <div className="modal-ai-priority-item" onClick={() => { setPriority('LOW'); setShowPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-low" /> LOW
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label>Start date</label>
                          <input type="date" className="modal-ai-input" value={taskStartTime} onChange={(e) => setTaskStartTime(e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label>Due date</label>
                          <input type="date" className="modal-ai-input" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="modal-ai-form">
                      <label>Number of tasks</label>
                      <input placeholder='Enter number task' type="number" min={1} className="modal-ai-input" value={listCount} onChange={(e) => setListCount(e.target.value)} />

                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label>Priority (applies to all)</label>
                          <div className="modal-ai-priority-select" ref={listPriorityRef}>
                            <button type="button" className="modal-ai-priority-btn" onClick={() => setShowListPriorityDropdown((s) => !s)}>
                              <span className={`modal-ai-priority-dot modal-ai-priority-${listPriority.toLowerCase()}`} />
                              <span style={{ marginLeft: 8 }}>{listPriority || 'Select'}</span>
                              <span style={{ marginLeft: 8, opacity: 0.6 }}>▾</span>
                            </button>
                            {showListPriorityDropdown && (
                              <div className="modal-ai-priority-dropdown">
                                <div className="modal-ai-priority-item" onClick={() => { setListPriority('HIGH'); setShowListPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-high" /> HIGH
                                </div>
                                <div className="modal-ai-priority-item" onClick={() => { setListPriority('MEDIUM'); setShowListPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-medium" /> MEDIUM
                                </div>
                                <div className="modal-ai-priority-item" onClick={() => { setListPriority('LOW'); setShowListPriorityDropdown(false); }}>
                                  <span className="modal-ai-priority-dot modal-ai-priority-low" /> LOW
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <label>Due date (applies to all)</label>
                          <input type="date" className="modal-ai-input" value={listDueDate} onChange={(e) => setListDueDate(e.target.value)} />
                        </div>
                      </div>

                      {/* <div style={{ color: '#6b7280', marginTop: 6 }}>Generates an array of empty task templates. Start date will be set to today for all tasks.</div> */}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <button className="modal-ai-send" onClick={handleGenerate} disabled={loading}>
                      {loading ? 'Loading Data...' : 'Generate Task'}
                    </button>
                    <button className="modal-ai-send" onClick={handleCopy} disabled={!generatedJson}>Copy Task</button>
                    <div style={{ flex: 1 }} />
                    <div style={{ color: '#6b7280' }}>{generatedJson ? 'Preview task' : 'No tasks previewed'}</div>
                  </div>

                  <div className="modal-ai-history">
                    {generatedJson ? (
                      <pre style={{ background: '#f9fafb', padding: 10, borderRadius: 8, overflow: 'auto' }}>{generatedJson}</pre>
                    ) : (
                      history.length === 0 ? (
                        <div className="modal-ai-empty"></div>
                      ) : (
                        history.map((m, i) => (
                          <div key={i} className={`modal-ai-msg modal-ai-msg-${m.from}`}>
                            <div className="modal-ai-msg-text">{m.text}</div>
                          </div>
                        ))
                      )
                    )}

                    <div className="modal-ai-footer">
                      <div style={{ flex: 1 }} />
                      <button className="modal-ai-btn modal-ai-btn-cancel" onClick={handleCancel}>Cancel</button>
                      <button className="modal-ai-btn modal-ai-btn-confirm" onClick={handleConfirm}>Confirm</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
