import { useState, useEffect } from 'react';
import './DocumentDetail.scss';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { updateDocument } from '../../../service/DocumentService';
import { useAuth } from '../../../context/AuthProvider';

const DocumentDetail = ({ id, onClose }) => {
  const { user } = useAuth();
  const documentPerson = useSelector((state) => state.document.documentPerson ?? []);
  const documentDetail = documentPerson?.find((doc) => doc.documentId === id);
  console.log('Document Detail Rendered:', documentDetail);
  const [title, setTitle] = useState(documentDetail?.documentTitle || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(documentDetail?.documentTitle || '');
  }, [documentDetail]);

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

    if (contentType?.includes('pdf')) {
      return url;
    } else if (
      contentType?.includes('word') ||
      url.endsWith('.doc') ||
      url.endsWith('.docx') ||
      url.endsWith('.xls') ||
      url.endsWith('.xlsx')
    ) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    } else if (contentType?.includes('image')) {
      return url;
    } else {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
  };

  const previewUrl = getViewerUrl(documentDetail.documentPath, documentDetail.documentContentType);

  return (
    <div className="document__detail">
      <div className="document__detail__container">
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

        {/* Info */}
        <div className="document__detail__content">
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

          {previewUrl && (
            <div className="document__preview">
              <iframe
                src={previewUrl}
                title="Document Preview"
                style={{
                  width: '100%',
                  height: '600px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
