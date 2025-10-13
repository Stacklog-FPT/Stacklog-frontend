import React, { useState, useCallback, useEffect } from 'react';
import './UploadFile.scss';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

const UploadFile = ({ onClose }) => {
  const { id } = useParams();
  console.log(id);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const dispatch = useDispatch();
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
      {dragActive && <div className="upload__overlay">Drog your file here</div>}

      <div className="upload__file__container">
        {!file ? (
          <>
            <p className="upload__text">
              Drog your file here <br /> or <span>choose your file</span>
            </p>
            <input
              type="file"
              id="uploadInput"
              onChange={handleFileChange}
              className="upload__input"
            />
          </>
        ) : (
          <div className="upload__preview">
            {preview ? (
              <img src={preview} alt="preview" className="preview__img" />
            ) : (
              <p className="preview__name">{file.name}</p>
            )}
            <button className="upload__btn">Upload</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
