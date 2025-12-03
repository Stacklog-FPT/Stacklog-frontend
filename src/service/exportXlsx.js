// Small helper to export array of objects to XLSX using SheetJS and FileSaver
// This file doesn't import xlsx/file-saver to avoid hard dependency during patching.
// To use, install: npm install xlsx file-saver

export async function exportToXlsx(rows, filename = "export.xlsx") {
  // dynamic import to work in browser ESM bundles
  const xlsxModule = await import("xlsx");
  const XLSX =
    xlsxModule && xlsxModule.default ? xlsxModule.default : xlsxModule;
  const fileSaverModule = await import("file-saver");
  const FileSaver =
    fileSaverModule && fileSaverModule.default
      ? fileSaverModule.default
      : fileSaverModule;

  if (!rows || !rows.length) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    FileSaver.saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      filename
    );
    return;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  FileSaver.saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    filename
  );
}
