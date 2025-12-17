export const upperCaseFirstChart = (str) => {
  if (!str) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function truncateName(name, maxChars = 3) {
  if (!name) return "";

  const trimmedName = name.trim();

  if (trimmedName.length <= maxChars) {
    return trimmedName;
  }

  return trimmedName.slice(0, maxChars) + ".....";
}
