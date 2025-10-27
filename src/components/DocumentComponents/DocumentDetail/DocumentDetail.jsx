import { useState, useEffect, useRef } from 'react';
import './DocumentDetail.scss';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { updateDocument } from '../../../service/DocumentService';
import { useAuth } from '../../../context/AuthProvider';
import Swal from 'sweetalert2';

const DocumentDetail = ({ id, onClose }) => {
  const { user } = useAuth();
  const documentPerson = useSelector((state) => state.document.documentPerson ?? []);
  const documentDetail = documentPerson?.find((doc) => doc.documentId === id);
  const [title, setTitle] = useState(documentDetail?.documentTitle || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewHeightRatio, setPreviewHeightRatio] = useState(0.35); // tỉ lệ preview trong container

  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(documentDetail?.documentTitle || '');
  }, [documentDetail]);

  // === Resize logic ===
  const handleMouseDown = () => {
    isResizing.current = true;
    document.body.style.cursor = 'row-resize';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top; // vị trí chuột tính từ top modal
    const newRatio = Math.min(Math.max(relativeY / rect.height, 0.2), 0.85); // giữ giữa 20%–85%
    setPreviewHeightRatio(1 - newRatio); // phần còn lại là preview
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!documentDetail) return null;

  const handleTitleSave = () => {
    const updatedDocuments = documentPerson.map((doc) =>
      doc.documentId === id ? { ...doc, documentTitle: title } : doc,
    );

    const payload = {
      documents: updatedDocuments.map((doc) => ({
        documentId: doc.documentId,
        documentTitle: doc.documentTitle,
        documentType: doc.documentType,
        documentLocations: doc.documentLocations.map((loc) => ({
          documentLocationId: loc.documentLocationId,
          groupId: loc.groupId,
        })),
      })),
    };

    updateDocument(payload, user.token, dispatch)
      .then(() => console.log('Documents saved!'))
      .catch((err) => console.error(err));

    setIsEditing(false);
  };

  const getViewerUrl = (url, contentType) => {
    if (!url) return null;

    if (contentType?.includes('pdf')) return url;
    if (
      contentType?.includes('word') ||
      url.endsWith('.doc') ||
      url.endsWith('.docx') ||
      url.endsWith('.xls') ||
      url.endsWith('.xlsx')
    ) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return null;
  };

  const handleShowDownLoadFile = () => {
    if (
      documentDetail.documentPath?.includes('pdf') ||
      documentDetail.documentPath?.includes('word') ||
      documentDetail.documentPath?.includes('excel') ||
      documentDetail.documentPath?.endsWith('.doc') ||
      documentDetail.documentPath?.endsWith('.docx') ||
      documentDetail.documentPath?.endsWith('.xls') ||
      documentDetail.documentPath?.endsWith('.xlsx')
    ) {
      return (
        <button className="choose__file__btn" onClick={handleDowndLoadFile}>
          Download this file
        </button>
      );
    }
    return null;
  };

  const handleDowndLoadFile = () => {
    Swal.fire({
      title: 'Download File',
      text: 'Are you sure you want to download this file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#045745',
      cancelButtonColor: '#c8cad4',
      iconColor: '#045745',
    }).then((result) => {
      if (result.isConfirmed) window.open(documentDetail.documentPath, '_blank');
    });
  };

  const previewUrl = getViewerUrl(documentDetail.documentPath, documentDetail.documentContentType);

  return (
    <div className="document__detail">
      <div className="document__detail__container" ref={containerRef}>
        {/* Header */}
        <div className="document__detail__header">
          {isEditing ? (
            <input
              className="title-input"
              type="text"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              disabled={loading}
            />
          ) : (
            <h2 onClick={() => setIsEditing(true)} className="editable-title">
              {title}
            </h2>
          )}
          <button className="close-btn" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Info + Preview */}
        <div className="document__detail__content">
          <div className="detail-section" style={{ flex: `${1 - previewHeightRatio}` }}>
            <div className="detail-item">
              <strong>Type:</strong> <span>{documentDetail.documentType}</span>
            </div>
            <div className="detail-item">
              <strong>Content Type:</strong> <span>{documentDetail.documentContentType}</span>
            </div>
            <div className="detail-item">
              <strong>Size:</strong> <span>{documentDetail.documentSize} KB</span>
            </div>
            <div className="detail-item">
              <strong>Path:</strong>{' '}
              <a href={documentDetail.documentPath} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
            <div className="detail-item">
              <strong>Download this file: </strong>
              {handleShowDownLoadFile()}
            </div>
          </div>

          {previewUrl && (
            <>
              <div className="resize-handle" onMouseDown={handleMouseDown}>
                <span className="resize-label">↕ Drag to resize</span>
              </div>
              <div className="document__preview" style={{ flex: previewHeightRatio }}>
                <iframe src={previewUrl} title="Document Preview" allowFullScreen></iframe>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
