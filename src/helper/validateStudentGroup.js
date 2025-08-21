export function canViewGroup(user, group) {
  if (!user || !group) return false;
  const role = user.role?.toLowerCase?.();
  if (role === "lecturer") return true;
  if (role === "student") {
    return (
      Array.isArray(group.groupStudent) &&
      group.groupStudent.includes(user.userId)
    );
  }
  return false;
}
