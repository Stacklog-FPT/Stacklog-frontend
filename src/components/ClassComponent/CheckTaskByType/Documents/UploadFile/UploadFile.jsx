import React, { useState, useCallback, useEffect, useRef } from 'react';
import './UploadFile.scss';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uploadDocument } from '../../../../../service/DocumentService';
import { useAuth } from '../../../../../context/AuthProvider';
import { useSelector } from 'react-redux';
import decodeToken from '../../../../../service/DecodeJwt';

const UploadFile = ({ onClose }) => {
  const { groupId } = useParams();
  const { groups } = useSelector((state) => state.group);
  const { user } = useAuth();
  const userDecode = decodeToken(user.token);
  const groupsUser = groups.filter((group) => {
    return group.groupStudents?.some((student) => student.userId === userDecode.id);
  });

  const [groupLocations, setGroupLocations] = useState([]);
  console.log('group choose debug:', groupLocations);

  const toggleGroupSelection = (groupId) => {
    setGroupLocations((prevGroupLocations) => {
      if (prevGroupLocations.some((group) => group.groupId === groupId)) {
        return prevGroupLocations.filter((group) => group.groupId !== groupId);
      } else {
        return [...prevGroupLocations, { groupId, documentLocationId: null }];
      }
    });
  };

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
      documentLocations: groupLocations,
    };

    console.log(payload);
    const res = await uploadDocument(payload, user.token, dispatch);
    console.log(res);
    setUploading(false);
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

          {/* Chọn nhóm */}
          <label className="upload__label">Select Groups</label>
          <div className="groups-selection">
            {groupsUser.map((group) => (
              <div key={group.groupsId} className="group-item">
                <input
                  type="checkbox"
                  checked={groupLocations.some((groupLoc) => groupLoc.groupId === group.groupsId)}
                  onChange={() => toggleGroupSelection(group.groupsId)}
                />
                <span>{group.groupsName}</span>
              </div>
            ))}
          </div>

          {/* Hiển thị các nhóm đã chọn */}
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
        </div>

        {!file ? (
          <>
            <p className="upload__text">
              Drag and drop file here! <br /> or <span>choose file</span>
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
