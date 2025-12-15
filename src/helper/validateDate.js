export const validateDate = (dateString) => {
  const selectedDate = new Date(dateString);
  const now = new Date();

  if (selectedDate < now) {
    return false;
  }

  return true;
};
