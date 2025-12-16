export const validateDate = (dateString) => {
  const selectedDate = new Date(dateString);
  const now = new Date();

  if (selectedDate < now) {
    return false;
  }

  return true;
};

export const validateDeadline = (dateString, timeString = null) => {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(dateString);
  selectedDate.setHours(0, 0, 0, 0);

  if (!timeString) {
    return selectedDate >= today;
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const fullSelected = new Date(dateString);
  fullSelected.setHours(hours, minutes, 0, 0);

  return fullSelected >= new Date();
};

export const isDeadlineExpired = (deadlineIsoString) => {
  if (!deadlineIsoString) return true;

  const deadline = new Date(deadlineIsoString);
  const now = new Date();

  if (isNaN(deadline.getTime())) return true;

  return deadline < now;
};

export const canEditOrDelete = (deadlineAdd, deadlineSubmit) => {
  const expiredAdd = isDeadlineExpired(deadlineAdd);
  const expiredSubmit = isDeadlineExpired(deadlineSubmit);
  return !(expiredAdd || expiredSubmit);
};

export const formatDateTime = (isoString) => {
  if (!isoString) return "-";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} - ${hours}:${minutes}:${seconds}`;
};
