export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}/${d.getFullYear()}`;
};
