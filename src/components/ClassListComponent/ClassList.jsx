import React, { useEffect, useState } from "react";
import "./ClassList.scss";
import { useAuth } from "../../context/AuthProvider";
import ClassService from "../../service/ClassService";
import userApi from "../../service/UserService";
import Detailstudent from "./Detailstudent/Detailstudent";
import decodeToken from "../../service/DecodeJwt";
const { getClassesByRole, createClass, craeteGroup, generateInviteCode } =
  ClassService();

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

  // Tạo lớp mới
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

  // Tạo group mới
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

  // Hàm gọi API lấy invite code
  const handleGenerateInviteCode = async () => {
    if (!selectedClass) return;
    try {
      const res = await generateInviteCode(user.token, selectedClass);
      console.log("API response:", res); // res là string

      let code = "";
      // res là chuỗi link, tách mã code từ chuỗi này
      const match = res.match(/code=([A-Za-z0-9\-]+)/);
      code = match ? match[1] : "";

      if (!code) throw new Error("Không lấy được mã invite code!");
      setInviteCode(code);
      setShowInvitePopup(true);
    } catch (err) {
      alert("Không thể lấy invite code!");
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
              <option value="all">Tất cả nhóm</option>
              {groups.map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
          </div>
          <div className="grades__component__container__filter__class__icon">
            <i className="fa-solid fa-file-arrow-down"></i>
            <i className="fa-solid fa-file-arrow-up"></i>
            {/* <button onClick={handleActivityAddClass}>
              <span>Add</span>
              <i className="fa-solid fa-plus"></i>
            </button> */}
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
                  <span>Gen Link</span>
                </button>
              </>
            )}
            {/* Button add group cho tất cả mọi người */}
            <button
              className="btn-create-class"
              style={{ background: "#2ecc71" }}
              onClick={() => setShowCreateGroup(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Group</span>
            </button>
          </div>
        </div>
        {/* Popup tạo lớp mới */}
        {showCreateClass && (
          <div className="popup-create-class">
            <div className="popup-content">
              <h3>Tạo lớp mới</h3>
              <input
                type="text"
                placeholder="Nhập tên lớp..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
              <div className="popup-actions">
                <button
                  onClick={handleCreateClass}
                  disabled={isCreating || !newClassName.trim()}
                  className="btn-confirm"
                >
                  {isCreating ? "Đang tạo..." : "Tạo"}
                </button>
                <button
                  onClick={() => setShowCreateClass(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Popup tạo group mới */}
        {showCreateGroup && (
          <div className="popup-create-class">
            <div className="popup-content">
              <h3>Tạo nhóm mới</h3>
              <input
                type="text"
                placeholder="Tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Mô tả nhóm..."
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
              />
              <input
                type="number"
                placeholder="Số thành viên tối đa"
                value={groupMax}
                min={1}
                onChange={(e) => setGroupMax(e.target.value)}
              />
              <label>Chọn Leader nhóm:</label>
              <select
                value={groupLeaderId}
                onChange={(e) => setGroupLeaderId(e.target.value)}
                style={{ marginBottom: "10px" }}
              >
                <option value="">-- Chọn Leader --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <label>Chọn thành viên nhóm:</label>
              <div className="group-members-list">
                {students.map((student) => (
                  <div className="member-checkbox-row" key={student._id}>
                    <label>
                      <input
                        type="checkbox"
                        value={student._id}
                        checked={groupUserIds.split(",").includes(student._id)}
                        onChange={(e) => {
                          let ids = groupUserIds ? groupUserIds.split(",") : [];
                          if (e.target.checked) {
                            ids.push(student._id);
                          } else {
                            ids = ids.filter((id) => id !== student._id);
                          }
                          setGroupUserIds(ids.join(","));
                        }}
                      />
                      <span className="member-name">{student.name}</span>
                      <span className="member-email">({student.email})</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="popup-actions">
                <button
                  onClick={handleCreateGroup}
                  disabled={
                    isCreatingGroup ||
                    !groupName.trim() ||
                    !groupLeaderId.trim() ||
                    !selectedClass
                  }
                  className="btn-confirm"
                >
                  {isCreatingGroup ? "Đang tạo..." : "Tạo"}
                </button>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Popup hiển thị invite code */}
        {showInvitePopup && (
          <div className="popup-create-class">
            <div className="popup-content">
              <h3>Invite Code</h3>
              <input
                type="text"
                value={inviteCode}
                readOnly
                style={{ marginBottom: "10px" }}
              />
              <div style={{ marginBottom: "10px", fontSize: "14px" }}>
                <span>Link gửi cho sinh viên:</span>
                <br />
                <span style={{ color: "#3498db", wordBreak: "break-all" }}>
                  {inviteCode
                    ? `${window.location.origin}/join-class/${inviteCode}`
                    : ""}
                </span>
              </div>
              <div className="popup-actions">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join-class/${inviteCode}`
                    );
                  }}
                  className="btn-confirm"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowInvitePopup(false)}
                  className="btn-cancel"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
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
                currentItems.map((item, index) => (
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
                      <span onClick={() => handleShowDetail(item)}>Detail</span>
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
    </div>
  );
};
export default ClassList;
