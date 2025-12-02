// src/components/admin/FormExcel/FormExcel.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./FormExcel.scss";
import { toast } from "sonner";
import { importByRole } from "../../../service/ExportImportService";
import { useAuth } from "../../../context/AuthProvider";

const FormExcel = ({ role, onClose }) => {
  console.log("Role in form: ", role);
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles?.length > 0) {
      toast.error("Invalid file. Only .xlsx and .xls are allowed.");
      return;
    }
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    toast.success(`Selected: ${selectedFile.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const roleForSend = role === "Lecture" ? "lecturer" : role;
    try {
      const response = await importByRole(
        roleForSend.toUpperCase(),
        file,
        user.token
      );
      toast.success("Import completed successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Import failed. Please check the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="excel-modal-wrapper">
      <div className="excel-modal-backdrop" onClick={onClose} />

      <div className="excel-modal-slide">
        <div className="modal-header">
          <h3>
            Import {role === "Lecture" ? "Lecturers" : "Students"} from Excel
          </h3>
          <button className="close-btn" onClick={onClose} disabled={uploading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div
            {...getRootProps()}
            className={`excel-dropzone ${isDragActive ? "active" : ""} ${
              uploading ? "uploading" : ""
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="file-selected">
                <i className="fa-solid fa-file-excel"></i>
                <p>{file.name}</p>
                <span className="change-text">Click or drop to replace</span>
              </div>
            ) : (
              <div className="dropzone-content">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag & drop Excel file here, or <strong>click to select</strong>"}
                </p>
                <small>Supports .xlsx • .xls</small>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" disabled={uploading}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-upload"
          >
            {uploading ? "Uploading..." : "Upload Excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormExcel;
