export function checkColumnExists(name, data) {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');
  
  const columnExist = data.find((c) => {
    const normalizedColumnName = c.statusTaskName.toLowerCase().replace(/\s+/g, '');
    return normalizedColumnName === normalizedName;
  });

  return !!columnExist;
}

export function validateShowEdit(name) {
  // Các column mặc định không được phép edit/delete
  const protectedColumns = ["TODO", "COMPLETED", "DONE", "DOING"];
  
  // Normalize: loại bỏ tất cả khoảng trắng và chuyển về uppercase
  const normalizedName = name.toUpperCase().replace(/\s+/g, '');
  
  // Nếu là column được bảo vệ thì return false (không cho hiện nút 3 chấm)
  if (protectedColumns.includes(normalizedName)) {
    return false;
  }

  return true;
}
