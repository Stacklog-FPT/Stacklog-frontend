import React from "react";
import "./AddClass.scss";
const AddClass = ({ handleActivityAddClass }) => {
  const fileInputRef = React.useRef();
  const excelInputRef = React.useRef();
  const [url, setUrl] = React.useState("");

  // Đóng modal khi nhấn ESC
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleActivityAddClass();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleActivityAddClass]);

  return (
    <div className="add_core">
      <div className="add_core__container">
        <div className="add_core__header">
          <span className="add_core__title">Upload the report</span>
          <button className="add_core__close" onClick={handleActivityAddClass}>
            &times;
          </button>
        </div>
        <div className="add_core__desc">
          Add your documents here, and you can upload up to 5 files max
        </div>
      </div>

      {/* Upload file */}
      <div className="add_core__section">
        <label className="add_core__upload_box" htmlFor="file-upload">
          <div className="add_core__icon">
            <i
              className="fa-solid fa-cloud-arrow-up"
              style={{ fontSize: 19, color: "#03624C" }}
            ></i>
          </div>
          <div>
            Drag your file(s) or{" "}
            <span
              className="add_core__browse"
              onClick={() => fileInputRef.current.click()}
            >
              browse
            </span>
          </div>
          <div className="add_core__note">Max 10 MB files are allowed</div>
          <input
            id="file-upload"
            type="file"
            multiple
            style={{ display: "none" }}
            ref={fileInputRef}
          />
        </label>
      </div>

      {/* Import Excel */}
      <div className="add_core__section">
        <div className="add_core__section_title">Import Excel</div>
        <label className="add_core__upload_box" htmlFor="excel-upload">
          <div className="add_core__icon">
            <i
              className="fa-solid fa-file-excel"
              style={{ fontSize: 19, color: "#107C41" }}
            ></i>
          </div>
          <div>
            Drag your file(s) or{" "}
            <span
              className="add_core__browse"
              onClick={() => excelInputRef.current.click()}
            >
              browse
            </span>
          </div>
          <div className="add_core__note">Max 10 MB files are allowed</div>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            ref={excelInputRef}
          />
        </label>
      </div>

      <div className="add_core__divider">
        <span>OR</span>
      </div>

      {/* Upload from URL */}
      <div className="add_core__section">
        <div className="add_core__section_title">Upload from URL</div>
        <div className="add_core__url_box">
          <input
            type="text"
            placeholder="Add file URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="add_core__upload_btn">Upload</button>
        </div>
      </div>

      {/* Footer */}
      <div className="add_core__footer">
        <button className="add_core__cancel" onClick={handleActivityAddClass}>
          Cancel
        </button>
        <button className="add_core__submit">Submit</button>
      </div>
    </div>
  );
};

export default AddClass;
