// Disable Hover Group
export function canViewGroup(user, group) {
  if (!user || !group) return false;
  const role = user.role?.toLowerCase?.();
  if (role === 'lecturer') return true;
  if (role === 'student') {
    return Array.isArray(group.groupStudent) && group.groupStudent.includes(user.userId);
  }
  return false;
}

// Is Leader
export const isLeader = (group, userId) => group.groupsLeaderId === userId;

// Is Lecture
export const isLecture = (user) => user.role === 'LECTURER';

// Check group or self

export const isGroup = (flag, selectedGroup = {}) => {
  if (flag) {
    if (!selectedGroup) {
      console.log('debug find an error here');
      return false;
    }
  }

  return true;
};
