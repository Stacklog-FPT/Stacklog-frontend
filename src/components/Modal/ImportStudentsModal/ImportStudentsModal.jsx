import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './ImportStudentsModal.scss';

const ImportStudentsModal = ({ onClose, onImport, className }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule && xlsxModule.default ? xlsxModule.default : xlsxModule;

      // Template data với định dạng chuẩn
      const templateData = [
        {
          Class: 'PRN409',
          RollNumber: 'de170159',
          Email: 'nhattvde170159@fpt.edu.vn',
          MemberCode: 'nhattvde170159',
          FullName: 'nhat.truong'
        },
        {
          Class: 'PRN409',
          RollNumber: 'de170537',
          Email: 'thanhtcde170537@fpt.edu.vn',
          MemberCode: 'thanhtcde170537',
          FullName: 'thanh.truong'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      // Set column widths
      ws['!cols'] = [
        { wch: 10 },  // Class
        { wch: 15 },  // RollNumber
        { wch: 30 },  // Email
        { wch: 20 },  // MemberCode
        { wch: 20 }   // FullName
      ];

      XLSX.writeFile(wb, 'Student_List_Template.xlsx');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Template file downloaded successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Download template failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download template file'
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select an Excel file to upload'
      });
      return;
    }

    setIsUploading(true);
    try {
      // Chỉ truyền file xuống để Classes.jsx xử lý, không parse ở đây
      if (onImport) {
        await onImport(selectedFile);
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message || 'Failed to upload file'
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="import-students-modal-overlay" onClick={onClose}>
      <div className="import-students-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-students-modal__header">
          <h2>Import Students</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="import-students-modal__content">
          <div className="class-info">
            <h3>{className}</h3>
          </div>

          <div className="info-box">
            <p>You need to download the <span className="link" onClick={handleDownloadTemplate}>File of Student List</span> to import students.</p>
          </div>

          <div className="upload-section">
            <p>Please click "Upload" to import the file</p>
            <label className="upload-btn">
              <i className="fa-solid fa-upload"></i> UPLOAD
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && (
              <div className="selected-file">
                <i className="fa-solid fa-file-excel"></i>
                <span>  {selectedFile.name}</span>
              </div>
            )}
          </div>

          <div className="instructions">
            <h4>Upload file</h4>
            <div className="instruction-step">
              <strong>Step 1:</strong> To import students, you need to download the student list by clicking link "File of Student List"
            </div>
            <div className="instruction-step">
              <strong>Step 2:</strong> Add student information to the columns: Class, RollNumber, Email, MemberCode, FullName.
            </div>
            <div className="instruction-step">
              <strong>Step 3:</strong> Click button "Upload" to upload the file of student list.
            </div>
            <div className="instruction-step">
              <strong>Step 4:</strong> Click "Import" button to complete importing students. The students are added to the class.
            </div>
          </div>

          <div className="import-students-modal__actions">
            <button className="btn btn--cancel" onClick={onClose} disabled={isUploading}>
              CANCEL
            </button>
            <button 
              className="btn btn--primary" 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'IMPORTING...' : 'IMPORT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportStudentsModal;
