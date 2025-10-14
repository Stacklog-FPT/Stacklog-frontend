import React, { useState, useCallback, useEffect, useRef } from 'react';
import './UploadFile.scss';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uploadDocument } from '../../../../../service/DocumentService';
import { useAuth } from '../../../../../context/AuthProvider';

const UploadFile = ({ onClose }) => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const modalRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [documentData, setDocumentData] = useState({
    documentTitle: '',
    documentType: 'NORMAL',
    documentAccesses: [],
  });

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

  const handleUploadFileService = async () => {
    if (!file) return alert('File is required!');
    setUploading(true);

    const payload = {
      file,
      documentTitle: documentData.documentTitle,
      documentType: documentData.documentType,
      documentAccesses: documentData.documentAccesses,
    };

    const res = await uploadDocument('', groupId, payload, user.token, dispatch);
    console.log(res);
    setUploading(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="upload__file_"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {dragActive && <div className="upload__overlay">Drog file here</div>}

      <div className="upload__file__container" ref={modalRef}>
        <h3 className="upload__title">Upload File</h3>

        <div className="upload__form">
          <label className="upload__label">
            Document Title
            <input
              type="text"
              value={documentData.documentTitle}
              onChange={(e) => setDocumentData({ ...documentData, documentTitle: e.target.value })}
              placeholder="Nhập tiêu đề..."
            />
          </label>

          <label className="upload__label">
            Document Type
            <select
              value={documentData.documentType}
              onChange={(e) => setDocumentData({ ...documentData, documentType: e.target.value })}
            >
              <option value="NORMAL">Normal</option>
              <option value="REFERENCE">Reference</option>
              <option value="CONFIDENTIAL">Confidential</option>
            </select>
          </label>
        </div>

        {!file ? (
          <>
            <p className="upload__text">
              Drag and drog file here! <br /> or <span>choose file</span>
            </p>
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
            <button className="upload__btn" onClick={handleUploadFileService} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
