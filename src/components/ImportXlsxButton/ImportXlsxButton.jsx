import React from "react";

const ImportXlsxButton = ({ onImport }) => {
  const handleChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const xlsxModule = await import("xlsx");
        const XLSX =
          xlsxModule && xlsxModule.default ? xlsxModule.default : xlsxModule;
        const data = evt.target.result;
        const wb = XLSX.read(data, { type: "array" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (onImport) onImport(json);
      } catch (err) {
        console.error("Import failed", err);
        alert("Import failed. See console for details.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  return (
    <label
      className="btn btn-secondary btn-export"
      style={{
        marginLeft: 8,
        width: 93,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i className="fa-solid fa-upload"></i> Import
      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </label>
  );
};

export default ImportXlsxButton;
