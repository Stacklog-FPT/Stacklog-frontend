import React, { useEffect } from 'react';
import './PopupCreateGroup.scss';
import { useAuth } from '../../../context/AuthProvider';
import Swal from 'sweetalert2';
import decodeToken from '../../../service/DecodeJwt';

const PopupCreateGroup = ({
  selectedGroup,
  selectedClass,
  classes,
  students,
  groupName,
  setGroupName,
  groupDesc,
  setGroupDesc,
  groupMax,
  setGroupMax,
  groupUserIds,
  setGroupUserIds,
  handleCreateGroup,
  isCreatingGroup,
  setShowCreateGroup,
  updateMemberToGroup,
}) => {
  const { user } = useAuth();
  
  // Lấy userId từ token
  const getUserIdFromToken = () => {
    const token = user?.token;
    if (token) {
      const decoded = decodeToken(token);
      return decoded?.userId || decoded?._id || decoded?.id;
    }
    return null;
  };
  
  useEffect(() => {
    const currentUserId = getUserIdFromToken();
   
  }, [selectedGroup, selectedClass, students, groupName, user]);
  
  // Khi chọn group, tự động điền thông tin group vào form
  useEffect(() => {
    if (selectedGroup !== 'all' && selectedGroup !== '') {
      const currentClass = classes.find((cls) => cls.classesId === selectedClass);
      const group = currentClass?.groups.find((g) => g.groupsId === selectedGroup);
      if (group) {
        setGroupName(group.groupsName || '');
        setGroupDesc(group.groupsDescriptions || '');
        setGroupMax(group.groupsMaxMember || 20);
        setGroupUserIds(
          group.groupStudents
            .map((stu) => stu.userId)
            .filter(Boolean)
            .join(','),
        );
      }
    }
    // Nếu tạo mới thì reset form và tự động tick người tạo
    if (selectedGroup === 'all') {
      setGroupName('');
      setGroupDesc('');
      setGroupMax(20);
      
      // Lấy userId từ token
      const currentUserId = getUserIdFromToken();
      
      // Tự động thêm user hiện tại vào groupUserIds
      if (currentUserId) {
        const isUserInStudents = students.some(student => student._id === currentUserId);
        if (isUserInStudents) {
          setGroupUserIds(currentUserId);
        } else {
          setGroupUserIds('');
        }
      } else {
        setGroupUserIds('');
      }
    }
    // eslint-disable-next-line
  }, [selectedGroup, selectedClass, classes, students]);

  return (
    <div className="popup-create-class">
      <div className="popup-content">
        <h3>
          {selectedGroup !== 'all' && selectedGroup !== ''
            ? 'Update group members'
            : 'Create new group'}
        </h3>
        {/* Form luôn hiển thị, dữ liệu tự động điền nếu đã chọn group */}
        <input
          type="text"
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={selectedGroup !== 'all'} // Do not allow editing group name when updating
        />
        <input
          type="text"
          placeholder="Group description..."
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
        />
        {/* Leader is assigned by backend (current user) — no need to select here */}
        <label>Select group members:</label>
        <div className="group-members-list">
          {students.map((student) => (
            <div className="member-checkbox-row" key={student._id}>
              <label>
                <input
                  type="checkbox"
                  value={student._id}
                  checked={groupUserIds.split(',').includes(student._id)}
                  onChange={(e) => {
                    let ids = groupUserIds ? groupUserIds.split(',') : [];
                    if (e.target.checked) {
                      ids.push(student._id);
                    } else {
                      ids = ids.filter((id) => id !== student._id);
                    }
                    setGroupUserIds(ids.join(','));
                  }}
                />
                <span className="member-name">{student.name}</span>
                <span className="member-email">({student.email})</span>
              </label>
            </div>
          ))}
        </div>
        <div
          className="popup-actions"
          onClick={(e) =>
            console.log('popup-actions clicked', { target: e.target, selectedGroup, selectedClass })
          }
        >
          {/* click on this wrapper will log attempts even if button is blocked */}
          <button
            onClick={() => {
              console.log('Confirm clicked', {
                selectedGroup,
                selectedClass,
                groupName,
                groupUserIds,
              });
              // validation (previously handled by disabled prop)
              if (isCreatingGroup) return;
              if (selectedGroup === 'all') {
                if (!groupName.trim()) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please enter group name'
                  });
                  return;
                }
                if (!selectedClass) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'No Class Selected',
                    text: 'No class selected'
                  });
                  return;
                }
                handleCreateGroup && handleCreateGroup();
              } else {
                // Tạo payload cho updateMemberToGroup
                const currentClass = classes.find((cls) => cls.classesId === selectedClass);
                const group = currentClass?.groups.find((g) => g.groupsId === selectedGroup);
                if (!group) return;
                const payload = {
                  groupsId: group.groupsId,
                  groupsName: group.groupsName,
                  groupsDescriptions: groupDesc,
                  groupsMaxMember: groupMax,
                  groupsAvgScore: group.groupsAvgScore,
                  groupsLeaderId: group.groupsLeaderId, // keep existing leader
                  classId: selectedClass,
                  groupUserUserIds: groupUserIds
                    .split(',')
                    .map((id) => id.trim())
                    .filter((id) => id),
                };
                updateMemberToGroup && updateMemberToGroup(payload);
                setShowCreateGroup(false);
              }
            }}
            className="btn-confirm"
          >
            {isCreatingGroup
              ? 'Processing...'
              : selectedGroup === 'all'
              ? 'Create Group'
              : 'Update Members'}
          </button>
          <button onClick={() => setShowCreateGroup(false)} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCreateGroup;
