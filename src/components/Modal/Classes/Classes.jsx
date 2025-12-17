import React, { useEffect, useState } from 'react';
import './Classes.scss';
import { useAuth } from '../../../context/AuthProvider';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentSemesterId,
  selectCurrentClassId,
  selectCurrentGroupId,
} from '../../../redux/slice/semesterSlice';
import ClassService from '../../../service/ClassService';
import Swal from 'sweetalert2';
import userApi from '../../../service/UserService';
import DetailStudent from '../../ClassListComponent/DetailStudent/DetailStudent';
import decodeToken from '../../../service/DecodeJwt';
import PopupCreateClass from '../../ClassListComponent/PopupCreateClass/PopupCreateClass';
import PopupCreateGroup from '../../ClassListComponent/PopupCreateGroup/PopupCreateGroup';
import PopupInviteCode from '../../ClassListComponent/PopupInviteCode/PopupInviteCode';
import ExportXlsxButton from '../../ExportXlsxButton/ExportXlsxButton';
import ImportXlsxButton from '../../ImportXlsxButton/ImportXlsxButton';
import ImportStudentsModal from '../ImportStudentsModal/ImportStudentsModal';
import { exportClassAndDownload, importClassByClassId } from '../../../service/ClassService';
import { fetchUserById } from "../../../service/UserService";
import GithubSetupModal from '../../GithubSetup/GithubSetupModal';

const {
  getClasses,
  createClass,
  craeteGroup,
  generateInviteCode,
  leaveGroup,
  kickUserFromGroup,
    updateMemberToGroup,
    deleteStudentFromClass,
    pickNewLeader,
} = ClassService();

const ClassList = ({ handleActivityAddClass }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const currentSemesterId = useSelector(selectCurrentSemesterId);
  const currentClassId = useSelector(selectCurrentClassId);
  const currentGroupId = useSelector(selectCurrentGroupId);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const itemsPerPage = 5;
  const decodeUser = decodeToken(user.token);

  const [unassignedStudents, setUnassignedStudents] = useState([]);

  // State cho popup tạo lớp mới
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State cho popup tạo group mới
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupMax, setGroupMax] = useState(20);
  const [groupLeaderId, setGroupLeaderId] = useState('');
  const [groupUserIds, setGroupUserIds] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // State cho popup invite code
  const [inviteCode, setInviteCode] = useState('');
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  // State cho GitHub setup modal
  const [showGithubSetup, setShowGithubSetup] = useState(false);

  // State cho Import Students modal
  const [showImportModal, setShowImportModal] = useState(false);


  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup('all');

    if (foundClass) {
      const unassignedGroup = foundClass.groups.find(
        (g) => g.groupsName.toLowerCase() === 'unassigned',
      );
      let userIds = [];
      if (unassignedGroup) {
        userIds = unassignedGroup.groupStudents.map((stu) => stu.userId);
      }
      const fetchUnassignedStudents = async () => {
        const studentInfos = await Promise.all(
          userIds.map(async (id) => {
            try {
              const u = await fetchUserById(user.token, id);
              return {
                _id: u._id,
                name: u.full_name,
                email: u.email,
                id: u.work_id,
                avatar: u.avatar_link,
              };
            } catch {
              return null;
            }
          }),
        );
        setUnassignedStudents(studentInfos.filter(Boolean));
      };
      fetchUnassignedStudents();
    }
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!user || !user.token) return;
    const fetchData = async () => {
      try {
        // Prefer semester-aware getClasses; fall back to empty list if semester not selected
        let data = [];
        if (currentSemesterId) {
          data = await getClasses(currentSemesterId, user.token, dispatch);
          console.log('Fetched classes for semester', currentSemesterId, data);
        }
        setClasses(data || []);
        if (data && data.length > 0) {
          const defaultClassId = currentClassId || data[0].classesId;
          setSelectedClass(defaultClassId);
          const found = data.find((c) => c.classesId === defaultClassId) || data[0];
          setGroups(found.groups || []);
          const defaultGroupId =
            currentGroupId || (found.groups && found.groups[0] ? found.groups[0].groupsId : 'all');
          setSelectedGroup(defaultGroupId || 'all');
        }
      } catch (err) {
        setClasses([]);
        setGroups([]);
      }
    };
    fetchData();
  }, [user, currentSemesterId, dispatch]);

  // Sync selection when sidebar selection changes
  useEffect(() => {
    if (!classes || classes.length === 0) return;
    if (currentClassId) {
      const found = classes.find((c) => c.classesId === currentClassId);
      if (found) {
        setSelectedClass(found.classesId);
        setGroups(found.groups || []);
        if (currentGroupId) {
          const g = found.groups.find((gg) => gg.groupsId === currentGroupId);
          setSelectedGroup(g ? g.groupsId : 'all');
        }
      }
    }
  }, [currentClassId, currentGroupId, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup('all');
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    let userIds = [];
    if (foundClass) {
      if (selectedGroup === 'all') {
        foundClass.groups.forEach((group) => {
          group.groupStudents.forEach((student) => {
            userIds.push(student.userId);
          });
        });
      } else {
        const group = foundClass.groups.find((g) => g.groupsId === selectedGroup);
        if (group) {
          userIds = group.groupStudents.map((s) => s.userId);
        }
      }
    }
    userIds = [...new Set(userIds)];
    const fetchStudents = async () => {
      const studentInfos = await Promise.all(
        userIds.map(async (id) => {
          try {
            const u = await fetchUserById(user.token, id);
            return {
              _id: u._id,
              name: u.full_name,
              email: u.email,
              id: u.work_id,
              avatar: u.avatar_link,
            };
          } catch {
            return null;
          }
        }),
      );
      setStudents(studentInfos.filter(Boolean));
    };
    fetchStudents();
    // eslint-disable-next-line
  }, [selectedClass, selectedGroup, classes, user]);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = students.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1);
  };

  const handleShowDetail = (student) => {
    const studentClasses = classes.filter((cls) =>
      cls.groups.some((group) => group.groupStudents.some((stu) => stu.userId === student._id)),
    );
    const classNames = studentClasses.map((cls) => cls.classesName);

    setSelectedStudent({
      ...student,
      classNames,
    });
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedStudent(null);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    setIsCreating(true);
    try {
      if (!currentSemesterId) {
        Swal.fire('Warning', 'Please select a semester before creating a class.', 'warning');
        setIsCreating(false);
        return;
      }
      const payload = {
        classesName: newClassName,
        lectureId: decodeUser.id,
      };
      console.log('handleCreateClass', payload);
      await createClass(currentSemesterId, user.token, payload, dispatch);
      setShowCreateClass(false);
      setNewClassName('');
      if (currentSemesterId) {
        const data = await getClasses(currentSemesterId, user.token, dispatch);
        setClasses(data);
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to create class!', 'error');
    }
    setIsCreating(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !selectedClass) return;
    setIsCreatingGroup(true);
    try {
      const payload = {
        groupsName: groupName,
        groupsDescriptions: groupDesc,
        groupsMaxMember: Number(groupMax) || 20,
        groupsAvgScore: 0,
        classId: selectedClass,
        groupUserUserIds: groupUserIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id),
      };
      await craeteGroup(user.token, payload, dispatch);
      setShowCreateGroup(false);
      setGroupName('');
      setGroupDesc('');
      setGroupMax(20);
      setGroupLeaderId('');
      setGroupUserIds('');
      // Reload lại danh sách lớp để cập nhật group mới
      if (currentSemesterId) {
        const data = await getClasses(currentSemesterId, user.token, dispatch);
        setClasses(data);
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to create group!', 'error');
    }
    setIsCreatingGroup(false);
  };

  const handleUpdateMemberToGroup = async (payload) => {
    try {
      await updateMemberToGroup(user.token, payload, dispatch);
      if (currentSemesterId) {
        const data = await getClasses(currentSemesterId, user.token, dispatch);
        setClasses(data);
      }
      Swal.fire('Success', 'Member added successfully!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to add member!', 'error');
    }
  };

  const handleGenerateInviteCode = async () => {
    if (!selectedClass) return;
    try {
      const res = await generateInviteCode(user.token, selectedClass);

      let code = '';
      const match = res.match(/code=([A-Za-z0-9\-]+)/);
      code = match ? match[1] : '';

      if (!code) throw new Error('Unable to retrieve invite code!');
      setInviteCode(code);
      setShowInvitePopup(true);
    } catch (err) {
      Swal.fire('Error', 'Unable to get invite code!', 'error');
    }
  };

  const hanldeDeleteUserFromGroup = async () => {
    try {
      const leaveConfirm = await Swal.fire({
        title: 'Leave group',
        text: 'Do you want to leave this group?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
      });
      if (!leaveConfirm.isConfirmed) return;

      if (!user.token) throw new Error('Token is missing');

      const currentClass = classes.find((cls) => cls.classesId === selectedClass);
      if (!currentClass) throw new Error('Class not found!');

      const oldGroup = currentClass.groups.find((g) => g.groupsId === selectedGroup);
      if (!oldGroup) throw new Error('Group not found!');

      const unassignedGroup = currentClass.groups.find(
        (g) => g.groupsName.toLowerCase() === 'unassigned',
      );
      if (!unassignedGroup) throw new Error('Unassigned group not found!');

      const payload = {
        classId: currentClass.classesId,
        oldGroupId: oldGroup.groupsId,
        unassignedGroupId: unassignedGroup.groupsId,
      };

      await leaveGroup(user.token, payload, dispatch);
      if (currentSemesterId) {
        const data = await getClasses(currentSemesterId, user.token, dispatch);
        setClasses(data);
      }
      Swal.fire('Left', 'Left group successfully!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to leave group!', 'error');
    }
  };

  const handleKickUser = async (studentId) => {
      try {
        const kickConfirm = await Swal.fire({
          title: 'Kick member',
          text: 'Do you want to kick this member from the group?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#6f42c1',
        });
        if (!kickConfirm.isConfirmed) return;

      const currentClass = classes.find((cls) => cls.classesId === selectedClass);
      if (!currentClass) throw new Error('Class not found!');

      const group = currentClass.groups.find((g) => g.groupsId === selectedGroup);
      if (!group) throw new Error('Group not found!');

      const unassignedGroup = currentClass.groups.find(
        (g) => g.groupsName.toLowerCase() === 'unassigned',
      );
      if (!unassignedGroup) throw new Error('Unassigned group not found!');

      const payload = {
        classId: currentClass.classesId,
        oldGroupId: group.groupsId,
        unassignedGroupId: unassignedGroup.groupsId,
      };
      await kickUserFromGroup(user.token, studentId, payload, dispatch);
      if (currentSemesterId) {
        const data = await getClasses(currentSemesterId, user.token, dispatch);
        setClasses(data);
      }
      Swal.fire('Kicked', 'Kicked successfully!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to kick user!', 'error');
    }
  };

  const handlePickNewLeader = async () => {
    try {
      const currentClass = classes.find((cls) => cls.classesId === selectedClass);
      if (!currentClass) return Swal.fire('Error', 'Class not found', 'error');
      const group = currentClass.groups.find((g) => g.groupsId === selectedGroup);
      if (!group) return Swal.fire('Error', 'Group not found', 'error');

      // build options from group members (exclude current leader)
      const opts = {};
      (group.groupStudents || []).forEach((m) => {
        if (!m || !m.userId) return;
        if (m.userId === group.groupsLeaderId) return; // exclude current leader
        const s = students.find((st) => st._id === m.userId) || {};
        const label = s.name || s.email || m.userId;
        opts[m.userId] = label;
      });

      if (Object.keys(opts).length === 0) {
        return Swal.fire('Info', 'No eligible members to pick as leader', 'info');
      }

      const { value: newLeaderId } = await Swal.fire({
        title: 'Pick new leader',
        input: 'select',
        inputOptions: opts,
        inputPlaceholder: 'Select a member',
        showCancelButton: true,
      });

      if (!newLeaderId) return;

      try {
        await pickNewLeader(user.token, group.groupsId, newLeaderId, dispatch);
        if (currentSemesterId) {
          const data = await getClasses(currentSemesterId, user.token, dispatch);
          setClasses(data || []);
        }
        Swal.fire('Success', 'Leader changed successfully', 'success');
      } catch (err) {
        // Fallback: mock the change locally if API fails
        const mocked = classes.map((c) => {
          if (c.classesId !== currentClass.classesId) return c;
          const groups = (c.groups || []).map((gr) =>
            gr.groupsId === group.groupsId ? { ...gr, groupsLeaderId: newLeaderId } : gr,
          );
          return { ...c, groups };
        });
        setClasses(mocked);
        Swal.fire('Success', 'Leader changed (mocked)', 'success');
      }
    } catch (e) {
      console.error('Pick new leader failed', e);
      Swal.fire('Error', 'Failed to pick new leader', 'error');
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!selectedClass) {
      return Swal.fire('Select class', 'Please select a class first', 'warning');
    }

    const result = await Swal.fire({
      title: 'Remove student from class',
      text: `Are you sure you want to remove ${student.name || student.email || ''} from this class?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStudentFromClass(user.token, student._id || student.id || student.userId, selectedClass, dispatch);
      Swal.fire('Removed', 'Student removed from class.', 'success');
      setStudents((prev) => prev.filter((s) => s._id !== (student._id || student.id || student.userId)));
      if (currentSemesterId) {
        try {
          const updated = await getClasses(currentSemesterId, user.token, dispatch);
          if (Array.isArray(updated)) setClasses(updated);
        } catch (e) {
          console.warn('Failed to refresh classes after delete', e);
        }
      }
    } catch (err) {
      console.error('Delete student failed', err);
      Swal.fire('Error', err.message || 'Failed to remove student', 'error');
    }
  };

  // Export full class members (ignore selectedGroup)
  const handleExportFullClass = async () => {
    try {
      const currentClass = classes.find((c) => c.classesId === selectedClass) || classes[0];
      if (!currentClass) {
        Swal.fire('Warning', 'No class selected to export', 'warning');
        return;
      }
      if (!user || !user.token) {
        Swal.fire('Warning', 'You must be logged in to export', 'warning');
        return;
      }

      // Call server export endpoint which returns the XLSX binary
      await exportClassAndDownload(currentClass.classesId, user.token);
    } catch (err) {
      console.error('Export full class failed', err);
      Swal.fire('Error', err?.message || 'Export failed. See console for details.', 'error');
    }
  };

  return (
    <div className="grades__component">
      <div className="grades__component__container">
        <div className="grades__component__container__filter__class">
          <div className="grades__component__container__filter__class__feature">
            <div className="class-group-display">
              <div className="class-item class-name">
                <span className="label">Class:</span>
                <span className="value">
                  {(() => {
                    const cls = classes.find((c) => c.classesId === selectedClass);
                    return cls ? cls.classesName : '-- No Class --';
                  })()}
                </span>
              </div>
              <div className="class-item group-name">
                <span className="label">Group:</span>
                <span className="value">
                  {selectedGroup === 'all'
                    ? 'All Member'
                    : groups.find((g) => g.groupsId === selectedGroup)?.groupsName || 'All Member'}
                </span>
              </div>
            </div>
            {selectedGroup !== 'all' &&
              (() => {
                const group = groups.find(
                  (g) =>
                    g.groupsId === selectedGroup && g.groupsName.toLowerCase() !== 'unassigned',
                );
                // Kiểm tra user hiện tại có trong group không
                // Only show Leave if current user is a member AND is NOT the group's leader
                if (
                  group &&
                  group.groupStudents.some((stu) => stu.userId === decodeUser.id) &&
                  decodeUser.id !== group.groupsLeaderId
                ) {
                  return (
                    <button
                      className="btn-leave-group"
                      style={{ marginLeft: '12px' }}
                      onClick={hanldeDeleteUserFromGroup}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket" style={{color: 'red'}}></i>
                      <span> Leave</span>
                    </button>
                  );
                }

                // If the user is the current leader, do not show Leave; they must first pick a new leader
                return null;
              })()}
          </div>
          <div className="grades__component__container__filter__class__icon">
            {(selectedGroup === 'all' ||
              groups.find((g) => g.groupsId === selectedGroup)?.groupsName?.toLowerCase() ===
                'unassigned') && (
              <button
                className="btn-add-member"
                style={{ marginLeft: '12px' }}
                onClick={() => {
                  setSelectedGroup('all');
                  setShowCreateGroup(true);
                }}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Group</span>
              </button>
            )}

            {(() => {
              const currentClass = classes.find((cls) => cls.classesId === selectedClass);
              if (!currentClass) return null;
              const group = currentClass.groups.find((g) => g.groupsId === selectedGroup);
              const isLecturer = user.role === 'LECTURER';
              const isLeader = group && decodeUser.id === group.groupsLeaderId;

              if (
                selectedGroup !== 'all' &&
                group &&
                group.groupsName.toLowerCase() !== 'unassigned' &&
                (isLecturer || isLeader)
              ) {
                return (
                  <>
                    <button
                      className="btn-add-member"
                      style={{ marginLeft: '12px', width: '96px' }}
                      onClick={() => setShowCreateGroup(true)}
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      <span>Member</span>
                    </button>
                    {isLeader ? (
                      <>
                        <button
                          className="btn-pick-leader"
                          style={{ marginLeft: '12px' }}
                          onClick={handlePickNewLeader}
                        >
                          <i className="fa-solid fa-user-check" />
                          <span style={{ marginLeft: 6 }}>Pick leader</span>
                        </button>
                        <button
                          className="btn-github-setup"
                          style={{ marginLeft: '12px', background: '#24292e', color: '#fff' }}
                          onClick={() => setShowGithubSetup(true)}
                        >
                          <i className="fa-brands fa-github" />
                          <span style={{ marginLeft: 6 }}>Setup GitHub</span>
                        </button>
                      </>
                    ) : null}
                  </>
                );
              }
              return null;
            })()}
            {user.role === 'LECTURER' && (
              <>
                {/* <button className="btn-create-class" onClick={() => setShowCreateClass(true)}>
                  <i className="fa-solid fa-plus"></i>
                  <span>Class</span>
                </button> */}
                {/* <button className="btn-gen-link" onClick={handleGenerateInviteCode}>
                  <i className="fa-solid fa-link"></i>
                  <span>Link</span>
                </button> */}
                {/* Export/Import Excel buttons (temporarily visible for testing) */}
                <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8 }}>
                  <ExportXlsxButton onExport={handleExportFullClass} />
                  <button
                    className="btn-secondary btn-export"
                    style={{
                      marginLeft: 8,
                      width: 93,
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      border: 'none'
                    }}
                    onClick={() => setShowImportModal(true)}
                  >
                    <i className="fa-solid fa-upload"></i> Import
                  </button>
                </div>
              </>
            )}

            {/* testing buttons removed — only lecturer-specific buttons remain */}
          </div>
        </div>
        <div className="grades__component__container__table__list">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Student</th>
                <th>Gmail</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems
                  .filter((item) => item._id !== '688e1238e4acb643f2bbc486') // Bỏ user này
                  .map((item, index) => (
                    <tr key={item._id || index}>
                      <td>
                        <p style={{ paddingTop: '15px' }}>{startIndex + index + 1}</p>
                      </td>
                      <td>
                        <div className="name__ava">
                          <img src={item.avatar} alt="avatar" />
                          <p>
                            {item.name}
                            {(() => {
                              const currentClass = classes.find((cls) => cls.classesId === selectedClass);
                              if (!currentClass) return null;
                              const group = currentClass.groups.find((g) => g.groupsId === selectedGroup);
                              if (!group || group.groupsName.toLowerCase() === 'unassigned') return null;
                              const isLeader = String(item._id) === String(group.groupsLeaderId);
                              return isLeader ? (
                                <i 
                                  className="fa-solid fa-crown" 
                                  style={{ 
                                    color: '#ffd700', 
                                    marginLeft: '6px', 
                                    fontSize: '14px',
                                    verticalAlign: 'middle'
                                  }}
                                  title="Group Leader"
                                />
                              ) : null;
                            })()}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p>{item.email}</p>
                      </td>
                      <td>
                        <p>{item.id}</p>
                      </td>
                      <td>
                        <button 
                          className="btn-kick-user" 
                          onClick={() => handleShowDetail(item)}
                        >
                          <span>Detail</span>
                        </button>
                        {(() => {
                          const currentClass = classes.find(
                            (cls) => cls.classesId === selectedClass,
                          );
                          if (!currentClass) return null;
                          const group = currentClass.groups.find(
                            (g) => g.groupsId === selectedGroup,
                          );
                          if (!group || group.groupsName.toLowerCase() === 'unassigned') {
                            // when on 'All Member' view (no specific group selected), lecturers should
                            // be able to remove a student from the class entirely
                            if (selectedGroup === 'all' && user.role === 'LECTURER') {
                              const isSelf =
                                (item && (item._id === decodeUser.id || item.id === decodeUser.id)) ||
                                (user &&
                                  (user._id === item._id ||
                                    user.id === item.id ||
                                    user.work_id === item.id));

                              if (!isSelf) {
                                return (
                                  <button
                                    className="btn-delete-student"
                                    style={{ marginLeft: '8px' }}
                                    onClick={() => handleDeleteStudent(item)}
                                  >
                                    <span>Remove from class</span>
                                  </button>
                                );
                              }
                            }
                            return null;
                          }

                          // hide Kick button on the row representing the current user
                          const isSelf =
                            (item && (item._id === decodeUser.id || item.id === decodeUser.id)) ||
                            (user &&
                              (user._id === item._id ||
                                user.id === item.id ||
                                user.work_id === item.id));

                          if (
                            (user.role === 'LECTURER' ||
                              (user.role === 'STUDENT' &&
                                decodeUser.id === group.groupsLeaderId)) &&
                            !isSelf
                          ) {
                            return (
                              <button
                                className="btn-kick-user"
                                style={{ marginLeft: '8px' }}
                                onClick={() => handleKickUser(item._id)}
                              >
                                <span>Remove</span>
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Oops! No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          {students.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="pagination__info">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      {showDetail && selectedStudent && (
        <DetailStudent student={selectedStudent} handleActiveDetailStudent={handleCloseDetail} />
      )}
      {showCreateClass && (
        <PopupCreateClass
          newClassName={newClassName}
          setNewClassName={setNewClassName}
          handleCreateClass={handleCreateClass}
          isCreating={isCreating}
          setShowCreateClass={setShowCreateClass}
        />
      )}

      {showCreateGroup && (
        <PopupCreateGroup
          selectedGroup={selectedGroup}
          selectedClass={selectedClass}
          classes={classes}
          students={unassignedStudents}
          groupName={groupName}
          setGroupName={setGroupName}
          groupDesc={groupDesc}
          setGroupDesc={setGroupDesc}
          groupMax={groupMax}
          setGroupMax={setGroupMax}
          groupUserIds={groupUserIds}
          setGroupUserIds={setGroupUserIds}
          handleCreateGroup={handleCreateGroup}
          isCreatingGroup={isCreatingGroup}
          setShowCreateGroup={setShowCreateGroup}
          updateMemberToGroup={handleUpdateMemberToGroup}
        />
      )}

      {showInvitePopup && (
        <PopupInviteCode inviteCode={inviteCode} setShowInvitePopup={setShowInvitePopup} />
      )}

      {showGithubSetup && (
        <GithubSetupModal
          groupId={selectedGroup}
          onClose={() => setShowGithubSetup(false)}
        />
      )}

      {showImportModal && (
        <ImportStudentsModal
          className={classes.find((c) => c.classesId === selectedClass)?.classesName || ''}
          onClose={() => setShowImportModal(false)}
          onImport={async (file) => {
            if (!selectedClass) {
              Swal.fire({
                icon: 'warning',
                title: 'No Class Selected',
                text: 'Please select a class before importing'
              });
              return;
            }
            try {
              console.log('Importing file:', file.name);
              const result = await importClassByClassId(
                selectedClass,
                file,
                user.token,
                null
              );
              console.log('Import result:', result);
              
              // Refresh data
              if (currentSemesterId) {
                const data = await getClasses(currentSemesterId, user.token, dispatch);
                setClasses(data || []);
                
                // Refresh students list ngay lập tức
                if (selectedClass) {
                  const foundClass = data.find((c) => c.classesId === selectedClass);
                  if (foundClass) {
                    setGroups(foundClass.groups || []);
                    
                    // Fetch lại students để hiển thị ngay
                    let userIds = [];
                    if (selectedGroup === 'all') {
                      foundClass.groups.forEach((g) => {
                        g.groupStudents.forEach((stu) => userIds.push(stu.userId));
                      });
                    } else {
                      const selectedGrp = foundClass.groups.find((g) => g.groupsId === selectedGroup);
                      if (selectedGrp) {
                        selectedGrp.groupStudents.forEach((stu) => userIds.push(stu.userId));
                      }
                    }
                    userIds = [...new Set(userIds)];
                    
                    // Fetch student info với đúng thứ tự tham số (token, id)
                    const studentInfos = await Promise.all(
                      userIds.map(async (id) => {
                        try {
                          const res = await fetchUserById(user.token, id);
                          return res || null;
                        } catch (err) {
                          console.error(`Failed to fetch user ${id}`, err);
                          return null;
                        }
                      })
                    );
                    setStudents(studentInfos.filter(Boolean));
                    setCurrentPage(1); // Reset về trang 1
                  }
                }
              }
              
              Swal.fire({
                icon: 'success',
                title: 'Import Successful',
                text: result?.message || 'Students imported successfully'
              });
            } catch (error) {
              console.error('Import failed:', error);
              Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: error.message || 'Failed to import students'
              });
              throw error; // Re-throw để modal biết có lỗi
            }
          }}
        />
      )}
    </div>
  );
};
export default ClassList;
