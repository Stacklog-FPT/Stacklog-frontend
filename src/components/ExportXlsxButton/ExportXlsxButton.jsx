import React from "react";
import { exportToXlsx } from "../../service/exportXlsx";
import "./ExportXlsxButton.scss";
import Swal from "sweetalert2";

const ExportXlsxButton = ({
  data,
  filename = "export.xlsx",
  transform,
  onExport,
  title,
}) => {
  const handleExport = async () => {
    if (onExport) {
      try {
        await onExport();
      } catch (err) {
        console.error("Export failed", err);
        Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'Export failed. See console for details.'
        });
      }
      return;
    }

    try {
      const rows = transform ? data.map(transform) : data;
      await exportToXlsx(rows, filename);
    } catch (err) {
      console.error("Export failed", err);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Export failed. See console for details.'
      });
    }
  };

  return (
    <button className="btn-export" type="button" onClick={handleExport}>
      <i className="fa-solid fa-download"></i>
      <span>Export</span>
    </button>
  );
};

export default ExportXlsxButton;
