import React, { useState, useCallback, useEffect, useRef } from 'react';
import './UploadFile.scss';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  getDocumentByUserId,
  uploadDocument,
  uploadDocumentByGroup,
} from '../../../../../service/DocumentService';
import { useAuth } from '../../../../../context/AuthProvider';
import { useSelector } from 'react-redux';
import decodeToken from '../../../../../service/DecodeJwt';
import { toast } from 'sonner';

const UploadFile = ({ onClose, isGroup }) => {
  const { groupId } = useParams();
  const { groups } = useSelector((state) => state.group);
  const { user } = useAuth();
  const userDecode = decodeToken(user.token);
  const { documentPerson } = useSelector((state) => state.document);
  const groupsUser = groups.filter((group) => {
    return group.groupStudents?.some((student) => student.userId === userDecode.id);
  });
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState([]);
  const [groupLocations, setGroupLocations] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentData, setDocumentData] = useState({
    documentTitle: '',
    documentType: 'NORMAL',
    documentLocations: [],
  });

  const dispatch = useDispatch();
  const modalRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview('');
      }
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (droppedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(droppedFile));
      } else {
        setPreview('');
      }
    }
  }, []);

  const toggleGroupSelection = (groupId) => {
    setGroupLocations((prevGroupLocations) => {
      if (prevGroupLocations.some((group) => group.groupId === groupId)) {
        return prevGroupLocations.filter((group) => group.groupId !== groupId);
      } else {
        return [...prevGroupLocations, { groupId, documentLocationId: null }];
      }
    });
  };

  // Fetch document data if user is not uploading a new document
  const handleGetDocumentPerson = async () => {
    await getDocumentByUserId(user.token, dispatch);
  };

  // Handle file upload person
  const handleUploadFileService = async () => {
    // Handle upload document for personal
    if (isGroup) return;

    if (!file) return toast.error('File is required!');
    setUploading(true);

    const payload = {
      file,
      documentTitle: documentData.documentTitle,
      documentType: documentData.documentType,
      documentLocations: groupLocations,
    };

    await uploadDocument(payload, user.token, dispatch);
    setUploading(false);
  };

  const handleUploadFileGroup = async () => {
    if (!isNewDocument) {
      if (!selectedDocument.documentId) {
        toast.error('Please select a document to attach!');
        return;
      }
      const payload = {
        documentId: null,
        documentTitle: documentData.documentTitle,
        documentContentType: selectedDocument.documentContentType,
        documentSize: selectedDocument.documentSize,
        documentType: selectedDocument.documentType,
        documentPath: selectedDocument.documentPath,
        documentLocations: [{ documentLocationId: null, groupId: groupId }],
      };
      await uploadDocumentByGroup(payload, user.token, dispatch);
      setUploading(false);
    } else {
      if (!file) {
        toast.error('File is empty!');
        return;
      }
      const payload = {
        file,
        documentTitle: documentData.documentTitle,
        documentType: documentData.documentType,
        documentLocations: [{ documentLocationId: null, groupId: groupId }],
      };
      await uploadDocument(payload, user.token, dispatch);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dragActive) return;

      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, dragActive]);

  useEffect(() => {
    handleGetDocumentPerson();
  }, [user.token]);
  return (
    <div
      className="upload__file_"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {dragActive && <div className="upload__overlay">Drag file here</div>}

      <div className="upload__file__container" ref={modalRef}>
        <h3 className="upload__title">Upload File</h3>

        <div className="upload__form">
          <label className="upload__label">
            Document Title
            <input
              type="text"
              value={documentData.documentTitle}
              onChange={(e) => setDocumentData({ ...documentData, documentTitle: e.target.value })}
              placeholder="The title..."
            />
          </label>

          <label className="upload__label">
            Document Type
            <select
              value={documentData.documentType}
              onChange={(e) => setDocumentData({ ...documentData, documentType: e.target.value })}
            >
              <option value="NORMAL">Normal</option>
              <option value="REPORT">Report</option>
            </select>
          </label>

          {/* {isGroup && (
            <div className="own__group">
              {documentPerson &&
                documentPerson.map((doc) => {
                  return (
                    <div key={doc.documentId} className="document__card_item d-flex gap-2">
                      <input
                        type="radio"
                        name="documentSelection"
                        checked={selectedDocument?.documentId === doc.documentId}
                        onChange={() => setSelectedDocument(doc)}
                      />
                      <span>{doc.documentTitle}</span>
                    </div>
                  );
                })}
            </div>
          )} */}

          {/* Checkbox to toggle "New Document" */}
          {!isNewDocument && isGroup && (
            <div className="document-selection">
              <label className="upload__label">Select Document from Existing</label>
              <div className="own__group">
                {documentPerson &&
                  documentPerson.map((doc) => {
                    return (
                      <div key={doc.documentId} className="document__card_item d-flex gap-2">
                        <input
                          type="radio"
                          name="documentSelection"
                          checked={selectedDocument?.documentId === doc.documentId}
                          onChange={() => setSelectedDocument(doc)}
                        />
                        <span>{doc.documentTitle}</span>
                      </div>
                    );
                  })}
              </div>

              <button
                className="choose__file__btn"
                onClick={handleUploadFileGroup}
                disabled={uploading}
                style={{ marginTop: '15px' }}
              >
                {uploading ? 'Attaching...' : 'Attach to Group'}
              </button>
            </div>
          )}
          {isGroup && (
            <div className="option_create_document d-flex align-center gap-2">
              <label className="upload__label">Choose new Document</label>
              <input
                type="checkbox"
                checked={isNewDocument}
                onChange={(e) => setIsNewDocument(e.target.checked)}
              />
            </div>
          )}

          {/* Chọn nhóm */}
          {!isGroup && (
            <div>
              <label className="upload__label">Select Groups</label>
              <div className="groups-selection">
                {groupsUser.map((group) => (
                  <div key={group.groupsId} className="group-item">
                    <input
                      type="checkbox"
                      checked={groupLocations.some(
                        (groupLoc) => groupLoc.groupId === group.groupsId,
                      )}
                      onChange={() => toggleGroupSelection(group.groupsId)}
                    />
                    <span>{group.groupsName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hiển thị các nhóm đã chọn */}
          {!isGroup && (
            <div className="selected-groups">
              {groupLocations.length > 0 && (
                <div className="selected-group-list">
                  {groupLocations.map((groupLoc) => {
                    const group = groupsUser.find((g) => g.groupsId === groupLoc.groupId);
                    return (
                      <div key={groupLoc.groupId} className="selected-group-item">
                        <span>{group?.groupsName}</span>
                        <button
                          type="button"
                          onClick={() => toggleGroupSelection(groupLoc.groupId)}
                          className="remove-group-btn"
                        >
                          &#10005; {/* dấu x */}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {(!isGroup || (isGroup && isNewDocument)) && (
          <>
            {!file ? (
              <>
                <p className="upload__text">
                  Drag and drop file here! <br />
                  or
                </p>
                <label htmlFor="uploadInput" className="choose__file__btn">
                  Choose File
                </label>
                <input
                  type="file"
                  id="uploadInput"
                  onChange={handleFileChange}
                  className="upload__input"
                  accept="*/*"
                />
              </>
            ) : (
              <div className="upload__preview">
                {preview ? (
                  <img src={preview} alt="preview" className="preview__img" />
                ) : (
                  <p className="preview__name">{file.name}</p>
                )}

                {isGroup ? (
                  <button
                    className="upload__btn"
                    onClick={handleUploadFileGroup}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Group'}
                  </button>
                ) : (
                  <button
                    className="upload__btn"
                    onClick={handleUploadFileService}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
