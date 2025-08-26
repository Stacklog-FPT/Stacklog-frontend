export const formatDateUI = (date) => {
  if (!date) return '';
  const parts = date.split('T');
  if (parts.length > 2) {
    date = parts[0] + 'T' + parts[1];
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj)) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};
