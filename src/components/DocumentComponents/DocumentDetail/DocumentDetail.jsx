import React, { useState, useEffect } from 'react';
import './DocumentDetail.scss';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { updateDocument } from '../../../service/DocumentService';
import { useAuth } from '../../../context/AuthProvider';

const DocumentDetail = ({ id, onClose }) => {
  const { user } = useAuth();
  const documentPerson = useSelector((state) => state.document.documentPerson ?? []);
  const documentDetail = documentPerson?.find((doc) => doc.documentId === id);
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

    console.log('payload document: ', payload);

    updateDocument(payload, user.token, dispatch)
      .then(() => console.log('Documents saved!'))
      .catch((err) => console.error(err));

    setIsEditing(false);
  };

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

        {/* Content */}
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
              Open Document
            </a>
          </div>
          <div className="detail-item">
            <strong>Groups:</strong>
            <ul>
              {documentDetail.documentLocations.map((loc) => (
                <li key={loc.documentLocationId}>{loc.groupId}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
