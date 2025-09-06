import React, { useEffect } from "react";
import "./PopupCreateGroup.scss";

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
  groupLeaderId,
  setGroupLeaderId,
  groupUserIds,
  setGroupUserIds,
  handleCreateGroup,
  isCreatingGroup,
  setShowCreateGroup,
  updateMemberToGroup,
}) => {

  console.log("groupLeaderId: ", groupLeaderId);
  // Khi chọn group, tự động điền thông tin group vào form
  useEffect(() => {
    if (selectedGroup !== "all" && selectedGroup !== "") {
      const currentClass = classes.find(
        (cls) => cls.classesId === selectedClass
      );
      const group = currentClass?.groups.find(
        (g) => g.groupsId === selectedGroup
      );
      if (group) {
        setGroupName(group.groupsName || "");
        setGroupDesc(group.groupsDescriptions || "");
        setGroupMax(group.groupsMaxMember || 20);
        setGroupLeaderId(group.groupsLeaderId || "");
        setGroupUserIds(
          group.groupStudents
            .map((stu) => stu.userId)
            .filter(Boolean)
            .join(",")
        );
      }
    }
    // Nếu tạo mới thì reset form
    if (selectedGroup === "all") {
      setGroupName("");
      setGroupDesc("");
      setGroupMax(20);
      setGroupLeaderId("");
      setGroupUserIds("");
    }
    // eslint-disable-next-line
  }, [selectedGroup, selectedClass, classes]);

  return (
    <div className="popup-create-class">
      <div className="popup-content">
        <h3>
          {selectedGroup !== "all" && selectedGroup !== ""
            ? "Cập nhật thành viên nhóm"
            : "Tạo nhóm mới"}
        </h3>
        {/* Form luôn hiển thị, dữ liệu tự động điền nếu đã chọn group */}
        <input
          type="text"
          placeholder="Tên nhóm..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={selectedGroup !== "all"} // Không cho sửa tên nhóm khi cập nhật
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
            onClick={() => {
              if (selectedGroup === "all") {
                handleCreateGroup();
              } else {
                // Tạo payload cho updateMemberToGroup
                const currentClass = classes.find(
                  (cls) => cls.classesId === selectedClass
                );
                const group = currentClass?.groups.find(
                  (g) => g.groupsId === selectedGroup
                );
                if (!group) return;
                const payload = {
                  groupsId: group.groupsId,
                  groupsName: group.groupsName,
                  groupsDescriptions: groupDesc,
                  groupsMaxMember: groupMax,
                  groupsAvgScore: group.groupsAvgScore,
                  groupsLeaderId: groupLeaderId,
                  classId: selectedClass,
                  groupUserUserIds: groupUserIds
                    .split(",")
                    .map((id) => id.trim())
                    .filter((id) => id),
                };

                console.log("Updating group with payload:", payload);
                updateMemberToGroup && updateMemberToGroup(payload);
                setShowCreateGroup(false);
              }
            }}
            disabled={
              isCreatingGroup ||
              (!groupName.trim() && selectedGroup === "all") ||
              !groupLeaderId.trim() ||
              !selectedClass
            }
            className="btn-confirm"
          >
            {isCreatingGroup
              ? "Đang xử lý..."
              : selectedGroup === "all"
              ? "Group"
              : "Member"}
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
  );
};

export default PopupCreateGroup;