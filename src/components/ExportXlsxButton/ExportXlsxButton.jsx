import React from "react";
import { exportToXlsx } from "../../service/exportXlsx";

const ExportXlsxButton = ({ data, filename = "export.xlsx", transform, onExport }) => {
  const handleExport = async () => {
    if (onExport) {
      try {
        await onExport();
      } catch (err) {
        console.error('Export failed', err);
        alert('Export failed. See console for details.');
      }
      return;
    }

    try {
      const rows = transform ? data.map(transform) : data;
      await exportToXlsx(rows, filename);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. See console for details.');
    }
  };

  return (
    <button type="button" className="btn btn-success btn-export" onClick={handleExport}>
      <i className="fa-solid fa-download"></i> Export
    </button>
  );
};

export default ExportXlsxButton;
