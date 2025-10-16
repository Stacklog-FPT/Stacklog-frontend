// Disable Hover Group
export function canViewGroup(user, group) {
  if (!user || !group) return false;

  const role = (user.role || '').toLowerCase();

  const uid = String(user.userId ?? user.id ?? user._id ?? user.sub ?? '');

  if (!uid) return false;

  if (role === 'lecturer') return true;
  if (role !== 'student') return false;

  const students = Array.isArray(group.groupStudents) ? group.groupStudents : [];
  return students.some((s) => String(s.userId) === uid);
}

// Is Leader
/**
 * Returns true if the given userId is the leader of the group.
 * Safely handles missing/undefined group or groupsLeaderId.
 * Accepts groupsLeaderId as string or an object with leader id fields.
 */
export const isLeader = (group, userId) => {
  if (!group || !userId) return false;

  const leader = group.groupsLeaderId;
  if (leader == null) return false;

  // If leader is an object, try common id fields
  if (typeof leader === 'object') {
    const id = leader.id ?? leader._id ?? leader.userId ?? leader.leaderId;
    return String(id) === String(userId);
  }

  // Otherwise compare primitive values as strings
  return String(leader) === String(userId);
};

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
