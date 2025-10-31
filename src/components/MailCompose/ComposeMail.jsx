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
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => setIsOpen(open), [open]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => {
        if (editorRef.current) editorRef.current.focus();
      }, 120);
    }
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

  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const getEditorHtml = () =>
    editorRef.current ? editorRef.current.innerHTML : "";
  const getEditorText = () =>
    editorRef.current ? editorRef.current.innerText : "";

  const handleSend = async () => {
    if (!to.trim()) {
      alert("Please enter recipient (To).");
      return;
    }
    setSending(true);
    try {
      const payload = {
        to: to
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cc: (cc || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bcc: (bcc || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        subject,
        html: getEditorHtml(),
        text: getEditorText(),
        attachments: attachments.map((a) => a.file),
      };
      await onSend(payload);
      setTo("");
      setSubject("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setAttachments([]);
      onClose && onClose();
    } catch (e) {
      console.error("Send failed", e);
      alert("Send failed. See console for details.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
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
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="To"
                  aria-label="To"
                />
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
                placeholder="Soạn thư..."
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
