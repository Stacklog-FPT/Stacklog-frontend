import React, { useEffect, useRef, useState } from "react";
import "./ComposeMail.scss";
import {
  FaPaperPlane,
  FaPaperclip,
  FaSmile,
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaTimes,
  FaWindowMinimize,
  FaWindowMaximize,
} from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { getClasses } from '../../service/ClassService';
import { sendNotificationToClasses } from '../../service/NotificationService';
import { useAuth } from '../../context/AuthProvider';

/**
 * Props:
 * - open: boolean (show/hide)
 * - onClose: fn
 * - onSend: fn({ to, subject, html, text, attachments }) -> Promise
 */
const ComposeMail = ({
  open = false,
  onClose = () => {},
  onSend = async () => {},
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]); // array of class objects
  const [classesList, setClassesList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sending, setSending] = useState(false);
  const containerRef = useRef(null);
  const reduxDispatch = useDispatch();
  const semesterId = useSelector((s) => s.semester?.currentSemesterId);
  const { user } = useAuth();
  const token = user?.token || null;

  useEffect(() => setIsOpen(open), [open]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => {
        if (editorRef.current) editorRef.current.focus();
      }, 120);
    }
    // fetch classes for autocomplete when opening
    (async () => {
      try {
        if (!token) return;
        // call getClasses service which also dispatches into redux; it returns normalized array
        const data = await getClasses(semesterId, token, reduxDispatch);
        setClassesList(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore
      }
    })();
  }, [isOpen, minimized]);

  const exec = (cmd, value = null) => {
    if (!editorRef.current) return;
    try {
      document.execCommand(cmd, false, value);
      editorRef.current.focus();
    } catch (e) {
      // silent
    }
  };

  const handleAttachClick = () =>
    fileInputRef.current && fileInputRef.current.click();

  const handleFiles = (files) => {
    if (!files) return;
    const list = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file: f,
      name: f.name,
      size: f.size,
    }));
    setAttachments((prev) => [...prev, ...list]);
  };

  // suggestions logic for To input (class name autocomplete)
  useEffect(() => {
    if (!to || to.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const q = String(to).toLowerCase();
    const matched = (classesList || []).filter((c) =>
      String(c.classesName || '').toLowerCase().includes(q)
    );
    setSuggestions(matched.slice(0, 8));
  }, [to, classesList]);

  // click outside to close suggestions
  useEffect(() => {
    const onDoc = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const addClassSelection = (cls) => {
    if (!cls) return;
    if (selectedClasses.find((s) => s.classesId === cls.classesId)) return;
    setSelectedClasses((prev) => [...prev, cls]);
    setTo('');
    setSuggestions([]);
  };

  const removeClassSelection = (id) => {
    setSelectedClasses((prev) => prev.filter((p) => p.classesId !== id));
  };

  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const getEditorHtml = () =>
    editorRef.current ? editorRef.current.innerHTML : "";
  const getEditorText = () =>
    editorRef.current ? editorRef.current.innerText : "";

  const handleSend = async () => {
    // if user selected classes, send using notification API
    if (selectedClasses.length === 0 && (!to || !to.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Recipient',
        text: 'Please enter recipient (To) or select a class.'
      });
      return;
    }
    setSending(true);
    try {
      const html = getEditorHtml();
      const text = getEditorText();

      if (selectedClasses.length > 0) {
        const body = {
          listClassId: selectedClasses.map((c) => c.classesId),
          subject: subject || '(no subject)',
          content: text || html || '',
        };
        await sendNotificationToClasses(token, body, reduxDispatch);
      }

      // Fallback: if user typed raw emails in `to`, still call onSend prop so existing flows work
      if (to && to.trim()) {
        const payload = {
          to: to
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          cc: (cc || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          bcc: (bcc || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          subject,
          html,
          text,
          attachments: attachments.map((a) => a.file),
        };
        await onSend(payload);
      }

      // clear UI
      setTo('');
      setSubject('');
      setSelectedClasses([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setAttachments([]);
      onClose && onClose();
    } catch (e) {
      console.error('Send failed', e);
      Swal.fire({
        icon: 'error',
        title: 'Send Failed',
        text: 'Send failed. See console for details.'
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`compose-overlay ${minimized ? "minimized" : ""}`}
      role="dialog"
      aria-label="Compose email"
    >
      <div className="compose-window" role="document">
        <div className="compose-header">
          <div className="compose-title">New Message</div>
          <div className="compose-controls">
            <button
              className="btn icon"
              title="Minimize"
              onClick={() => setMinimized((s) => !s)}
              aria-pressed={minimized}
            >
              {minimized ? <FaWindowMaximize /> : <FaWindowMinimize />}
            </button>
            <button
              className="btn icon close"
              title="Close"
              onClick={() => {
                setIsOpen(false);
                onClose && onClose();
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="compose-to-row">
              <div className="compose-to send-to-label">
                {/* selected class chips */}
                {selectedClasses && selectedClasses.length > 0 && (
                  <div className="selected-chips" aria-hidden={false}>
                    {selectedClasses.map((c) => (
                      <span className="chip" key={c.classesId}>
                        <span className="chip-label">{c.classesName}</span>
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() => removeClassSelection(c.classesId)}
                          aria-label={`Remove ${c.classesName}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="To Class"
                  aria-label="To"
                />

                {/* suggestions dropdown */}
                {suggestions && suggestions.length > 0 && (
                  <ul className="compose-suggestions" role="listbox">
                    {suggestions.map((s) => (
                      <li
                        key={s.classesId || s.id || s._id}
                        role="option"
                        tabIndex={0}
                        onClick={() => addClassSelection(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addClassSelection(s);
                        }}
                      >
                        <div className="suggestion-main">{s.classesName}</div>
                        <div className="suggestion-sub">{s.classesId}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {showCc && (
              <div className="compose-cc">
                <input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Cc"
                  aria-label="Cc"
                />
              </div>
            )}

            {showBcc && (
              <div className="compose-bcc">
                <input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Bcc"
                  aria-label="Bcc"
                />
              </div>
            )}

            <div className="compose-subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                aria-label="Subject"
              />
            </div>

            <div className="compose-editor" aria-multiline="true">
              <div
                ref={editorRef}
                className="editor"
                contentEditable
                suppressContentEditableWarning
                placeholder="Content..."
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
              />
            </div>

            {attachments.length > 0 && (
              <div className="compose-attachments">
                {attachments.map((a) => (
                  <div className="attachment-item" key={a.id}>
                    <div className="att-name">{a.name}</div>
                    <button
                      className="btn small"
                      onClick={() => removeAttachment(a.id)}
                      aria-label={`Remove ${a.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="compose-bottom">
              <div className="compose-actions-left">
                <button
                  className="btn send-pill"
                  onClick={handleSend}
                  disabled={sending}
                >
                  <FaPaperPlane style={{ marginRight: 8 }} />
                  <span className="send-text">
                    {sending ? "Sending..." : "Send"}
                  </span>
                  <span className="send-caret">▾</span>
                </button>
              </div>
            </div>
          </>
        )}

        {minimized && (
          <div
            className="compose-minimized-bar"
            onClick={() => setMinimized(false)}
          >
            <div className="min-title">New Message</div>
            <div className="min-actions">
              <button
                className="btn"
                onClick={() => setMinimized(false)}
                aria-label="Restore"
              >
                Restore
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposeMail;
