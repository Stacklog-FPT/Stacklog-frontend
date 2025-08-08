import React, { useEffect, useState } from "react";
import "./ClassList.scss";
import { useAuth } from "../../context/AuthProvider";
import ClassService from "../../service/ClassService";
import userApi from "../../service/UserService";
import Detailstudent from "./Detailstudent/Detailstudent";
import decodeToken from "../../service/DecodeJwt";
import PopupCreateClass from "./PopupCreateClass/PopupCreateClass";
import PopupCreateGroup from "./PopupCreateGroup/PopupCreateGroup";
import PopupInviteCode from "./PopupInviteCode/PopupInviteCode";

const {
  getClassesByRole,
  createClass,
  craeteGroup,
  generateInviteCode,
  leaveGroup,
  kickUserFromGroup,
  updateMemberToGroup,
} = ClassService();

const ClassList = ({ handleActivityAddClass }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const itemsPerPage = 5;
  const decodeUser = decodeToken(user.token);

  const [unassignedStudents, setUnassignedStudents] = useState([]);

  // State cho popup tạo lớp mới
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // State cho popup tạo group mới
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupMax, setGroupMax] = useState(20);
  const [groupLeaderId, setGroupLeaderId] = useState("");
  const [groupUserIds, setGroupUserIds] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // State cho popup invite code
  const [inviteCode, setInviteCode] = useState("");
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const { getUserById } = userApi();

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup("all");

    if (foundClass) {
      const unassignedGroup = foundClass.groups.find(
        (g) => g.groupsName.toLowerCase() === "unassigned"
      );
      let userIds = [];
      if (unassignedGroup) {
        userIds = unassignedGroup.groupStudents.map((stu) => stu.userId);
      }
      const fetchUnassignedStudents = async () => {
        const studentInfos = await Promise.all(
          userIds.map(async (id) => {
            try {
              const u = await getUserById(user.token, id);
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
          })
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
        const data = await getClassesByRole(user.token, user.role);
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].classesId);
          setGroups(data[0].groups);
        }
      } catch (err) {
        setClasses([]);
        setGroups([]);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup("all");
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    let userIds = [];
    if (foundClass) {
      if (selectedGroup === "all") {
        foundClass.groups.forEach((group) => {
          group.groupStudents.forEach((student) => {
            userIds.push(student.userId);
          });
        });
      } else {
        const group = foundClass.groups.find(
          (g) => g.groupsId === selectedGroup
        );
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
            const u = await getUserById(user.token, id);
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
        })
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

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setCurrentPage(1);
  };

  const handleShowDetail = (student) => {
    const studentClasses = classes.filter((cls) =>
      cls.groups.some((group) =>
        group.groupStudents.some((stu) => stu.userId === student._id)
      )
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
      const payload = {
        classesName: newClassName,
        lectureId: decodeUser.id,
      };
      await createClass(user.token, payload);
      setShowCreateClass(false);
      setNewClassName("");
      const data = await getClassesByRole(user.token, user.role);
      setClasses(data);
    } catch (err) {
      alert("Tạo lớp thất bại!");
    }
    setIsCreating(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupLeaderId.trim() || !selectedClass) return;
    setIsCreatingGroup(true);
    try {
      const payload = {
        groupsName: groupName,
        groupsDescriptions: groupDesc,
        groupsMaxMember: Number(groupMax) || 20,
        groupsAvgScore: 0,
        groupsLeaderId: groupLeaderId,
        classId: selectedClass,
        groupUserUserIds: groupUserIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      };
      await craeteGroup(user.token, payload);
      setShowCreateGroup(false);
      setGroupName("");
      setGroupDesc("");
      setGroupMax(20);
      setGroupLeaderId("");
      setGroupUserIds("");
      // Reload lại danh sách lớp để cập nhật group mới
      const data = await getClassesByRole(user.token, user.role);
      setClasses(data);
    } catch (err) {
      alert("Tạo group thất bại!");
    }
    setIsCreatingGroup(false);
  };

  const handleUpdateMemberToGroup = async (payload) => {
    try {
      await updateMemberToGroup(user.token, payload);
      const data = await getClassesByRole(user.token, user.role);
      setClasses(data);
      alert("Thêm thành viên thành công!");
    } catch (err) {
      alert("Thêm thành viên thất bại!");
    }
  };

  const handleGenerateInviteCode = async () => {
    if (!selectedClass) return;
    try {
      const res = await generateInviteCode(user.token, selectedClass);

      let code = "";
      const match = res.match(/code=([A-Za-z0-9\-]+)/);
      code = match ? match[1] : "";

      if (!code) throw new Error("Không lấy được mã invite code!");
      setInviteCode(code);
      setShowInvitePopup(true);
    } catch (err) {
      alert("Không thể lấy invite code!");
    }
  };

  const hanldeDeleteUserFromGroup = async () => {
    try {
      if (!window.confirm("Bạn muốn rời khỏi nhóm này?")) return;

      if (!user.token) throw new Error("Token is missing");

      const currentClass = classes.find(
        (cls) => cls.classesId === selectedClass
      );
      if (!currentClass) throw new Error("Không tìm thấy lớp!");

      const oldGroup = currentClass.groups.find(
        (g) => g.groupsId === selectedGroup
      );
      if (!oldGroup) throw new Error("Không tìm thấy group!");

      const unassignedGroup = currentClass.groups.find(
        (g) => g.groupsName.toLowerCase() === "unassigned"
      );
      if (!unassignedGroup) throw new Error("Không tìm thấy group unassigned!");

      const payload = {
        classId: currentClass.classesId,
        oldGroupId: oldGroup.groupsId,
        unassignedGroupId: unassignedGroup.groupsId,
      };

      await leaveGroup(user.token, payload);
      const data = await getClassesByRole(user.token, user.role);
      setClasses(data);
      alert("Rời nhóm thành công!");
    } catch (error) {
      alert("Rời nhóm thất bại!");
    }
  };

  const handleKickUser = async (studentId) => {
    try {
      if (!window.confirm("Bạn muốn kick thành viên này khỏi nhóm?")) return;

      const currentClass = classes.find(
        (cls) => cls.classesId === selectedClass
      );
      if (!currentClass) throw new Error("Không tìm thấy lớp!");

      const group = currentClass.groups.find(
        (g) => g.groupsId === selectedGroup
      );
      if (!group) throw new Error("Không tìm thấy group!");

      const unassignedGroup = currentClass.groups.find(
        (g) => g.groupsName.toLowerCase() === "unassigned"
      );
      if (!unassignedGroup) throw new Error("Không tìm thấy group unassigned!");

      const payload = {
        classId: currentClass.classesId,
        oldGroupId: group.groupsId,
        unassignedGroupId: unassignedGroup.groupsId,
      };
      await kickUserFromGroup(user.token, studentId, payload);
      const data = await getClassesByRole(user.token, user.role);
      setClasses(data);
      alert("Kick thành công!");
    } catch (error) {
      alert("Kick thất bại!");
    }
  };

  return (
    <div className="grades__component">
      <div className="grades__component__container">
        <div className="grades__component__container__filter__class">
          <div className="grades__component__container__filter__class__feature">
            <select value={selectedClass} onChange={handleClassChange}>
              <option>-- Choose Class --</option>
              {classes.map((cls) => (
                <option key={cls.classesId} value={cls.classesId}>
                  {cls.classesName}
                </option>
              ))}
            </select>
            <select value={selectedGroup} onChange={handleGroupChange}>
              <option value="all">All Member</option>
              {groups.map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
            {selectedGroup !== "all" &&
              (() => {
                const group = groups.find(
                  (g) =>
                    g.groupsId === selectedGroup &&
                    g.groupsName.toLowerCase() !== "unassigned"
                );
                // Kiểm tra user hiện tại có trong group không
                if (
                  group &&
                  group.groupStudents.some(
                    (stu) => stu.userId === decodeUser.id
                  )
                ) {
                  return (
                    <button
                      className="btn-leave-group"
                      style={{ marginLeft: "12px" }}
                      onClick={hanldeDeleteUserFromGroup}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span> Leave</span>
                    </button>
                  );
                }
                return null;
              })()}
          </div>
          <div className="grades__component__container__filter__class__icon">
            {selectedGroup === "all" && (
              <button
                className="btn-add-member"
                style={{ marginLeft: "12px" }}
                onClick={() => {
                  setSelectedGroup("all");
                  setShowCreateGroup(true);
                }}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span> Group</span>
              </button>
            )}

            {(() => {
              const currentClass = classes.find(
                (cls) => cls.classesId === selectedClass
              );
              if (!currentClass) return null;
              const group = currentClass.groups.find(
                (g) => g.groupsId === selectedGroup
              );
              const isLecturer = user.role === "LECTURER";
              const isLeader = group && decodeUser.id === group.groupsLeaderId;

              if (
                selectedGroup !== "all" &&
                group &&
                group.groupsName.toLowerCase() !== "unassigned" &&
                (isLecturer || isLeader)
              ) {
                return (
                  <button
                    className="btn-add-member"
                    style={{ marginLeft: "12px" }}
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <i className="fa-solid fa-user-plus"></i>
                    <span>Member</span>
                  </button>
                );
              }
              return null;
            })()}
            {user.role === "LECTURER" && (
              <>
                <button
                  className="btn-create-class"
                  onClick={() => setShowCreateClass(true)}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Class</span>
                </button>
                <button
                  className="btn-gen-link"
                  onClick={handleGenerateInviteCode}
                >
                  <i className="fa-solid fa-link"></i>
                  <span>Link</span>
                </button>
              </>
            )}
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
                  .filter((item) => item._id !== "688e1238e4acb643f2bbc486") // Bỏ user này
                  .map((item, index) => (
                    <tr key={item._id || index}>
                      <td>
                        <p style={{ paddingTop: "15px" }}>
                          {startIndex + index + 1}
                        </p>
                      </td>
                      <td>
                        <div className="name__ava">
                          <img src={item.avatar} alt="avatar" />
                          <p>{item.name}</p>
                        </div>
                      </td>
                      <td>
                        <p>{item.email}</p>
                      </td>
                      <td>
                        <p>{item.id}</p>
                      </td>
                      <td>
                        <span onClick={() => handleShowDetail(item)}>
                          Detail
                        </span>
                        {(() => {
                          const currentClass = classes.find(
                            (cls) => cls.classesId === selectedClass
                          );
                          if (!currentClass) return null;
                          const group = currentClass.groups.find(
                            (g) => g.groupsId === selectedGroup
                          );
                          if (
                            !group ||
                            selectedGroup === "all" ||
                            group.groupsName.toLowerCase() === "unassigned"
                          )
                            return null;

                          if (
                            user.role === "LECTURER" ||
                            (user.role === "STUDENT" &&
                              decodeUser.id === group.groupsLeaderId)
                          ) {
                            return (
                              <button
                                className="btn-kick-user"
                                style={{ marginLeft: "8px" }}
                                onClick={() => handleKickUser(item._id)}
                              >
                                <span>Kick</span>
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
                  <td colSpan={5} style={{ textAlign: "center" }}>
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
        <Detailstudent
          student={selectedStudent}
          handleActiveDetailStudent={handleCloseDetail}
        />
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
          groupLeaderId={groupLeaderId}
          setGroupLeaderId={setGroupLeaderId}
          groupUserIds={groupUserIds}
          setGroupUserIds={setGroupUserIds}
          handleCreateGroup={handleCreateGroup}
          isCreatingGroup={isCreatingGroup}
          setShowCreateGroup={setShowCreateGroup}
          updateMemberToGroup={handleUpdateMemberToGroup}
        />
      )}

      {showInvitePopup && (
        <PopupInviteCode
          inviteCode={inviteCode}
          setShowInvitePopup={setShowInvitePopup}
        />
      )}
    </div>
  );
};
export default ClassList;
