export function checkColumnExists(name, data) {
  const normalizedName = name.toLowerCase().replace(/\s+/g, "");

  const columnExist = data.find((c) => {
    const normalizedColumnName = c.statusTaskName
      .toLowerCase()
      .replace(/\s+/g, "");
    return normalizedColumnName === normalizedName;
  });

  return !!columnExist;
}

export function validateShowEdit(name) {
  // Các column mặc định không được phép edit/delete
  const protectedColumns = ["TODO", "COMPLETED", "DOING", "CANCEL"];

  // Normalize: loại bỏ tất cả khoảng trắng và chuyển về uppercase
  const normalizedName = name.toUpperCase().replace(/\s+/g, "");

  // Nếu là column được bảo vệ thì return false (không cho hiện nút 3 chấm)
  if (protectedColumns.includes(normalizedName)) {
    return false;
  }

  return true;
}

export function sortStatusByOrder(statuses) {
  const statusOrder = {
    TODO: 1,
    DOING: 2,
    COMPLETED: 3,
    CANCEL: 4,
  };

  return [...statuses].sort((a, b) => {
    // Normalize tên status (bỏ khoảng trắng và uppercase)
    const nameA = a.statusTaskName.toUpperCase().replace(/\s+/g, "");
    const nameB = b.statusTaskName.toUpperCase().replace(/\s+/g, "");

    // Lấy thứ tự ưu tiên, nếu không có trong statusOrder thì cho về cuối (999)
    const orderA = statusOrder[nameA] || 999;
    const orderB = statusOrder[nameB] || 999;

    // So sánh theo thứ tự ưu tiên
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Nếu cùng thứ tự ưu tiên (đều là custom status), sort theo tên
    return nameA.localeCompare(nameB);
  });
}
