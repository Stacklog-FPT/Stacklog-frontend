/**
 * Helper để tải file từ ArrayBuffer / Blob về máy người dùng
 * Hỗ trợ lấy tên file từ header Content-Disposition (backend gửi về)
 *
 * @param {ArrayBuffer|Blob} data - Dữ liệu file (thường là response.data từ axios)
 * @param {string} defaultFilename - Tên file mặc định nếu không lấy được từ header
 * @param {string} contentType - MIME type (ví dụ: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
 * @param {Object} headers - Tất cả headers từ response (để lấy Content-Disposition)
 */
const downloadFile = (
  data,
  defaultFilename = "download.xlsx",
  contentType = "application/octet-stream",
  headers = {}
) => {
  try {
    let filename = defaultFilename;

    const disposition =
      headers["content-disposition"] || headers["Content-Disposition"];
    if (disposition) {
      // Tìm filename*=UTF-8''... trước
      let match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (match) {
        try {
          filename = decodeURIComponent(match[1].trim());
        } catch (e) {
          filename = match[1].trim();
        }
      } else {
        // Nếu không có filename*, tìm filename="..."
        match = disposition.match(/filename="([^"]+)"/i);
        if (match) {
          filename = match[1].trim();
        } else {
          // Cuối cùng thử filename=... (không có quotes)
          match = disposition.match(/filename=([^;]+)/i);
          if (match) {
            filename = match[1].trim().replace(/^"|"$/g, "");
          }
        }
      }
    }

    const blob =
      data instanceof Blob ? data : new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error("Download file failed:", error);
    return { success: false, error: error.message };
  }
};

export default downloadFile;
