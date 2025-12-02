import React from "react";
import { exportToXlsx } from "../../service/exportXlsx";
import "./ExportXlsxButton.scss";
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
        alert("Export failed. See console for details.");
      }
      return;
    }

    try {
      const rows = transform ? data.map(transform) : data;
      await exportToXlsx(rows, filename);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. See console for details.");
    }
  };

  return (
    <button className="btn-export" type="button" onClick={handleExport}>
      <i style={{ color: "#000" }} className="fa-solid fa-download"></i>
    </button>
  );
};

export default ExportXlsxButton;
