export const formatFileSize = (sizeInKB) => {
  if (!sizeInKB || isNaN(sizeInKB)) return '0 KB';

  if (sizeInKB < 1024) {
    return Math.round(sizeInKB) + ' KB';
  } else if (sizeInKB < 1024 * 1024) {
    return Math.round(sizeInKB / 1024) + ' MB';
  } else {
    return Math.round(sizeInKB / (1024 * 1024)) + ' GB';
  }
};
