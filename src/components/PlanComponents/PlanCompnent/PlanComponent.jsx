import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DetailTopicForm from "./DetailTopicForm/DetailTopicForm";
import {
  getPlansApi,
  approvePlanApi,
  rejectPlanApi,
} from "../../../service/PlanService";
import "./PlanComponent.scss";
import { useAuth } from "../../../context/AuthProvider";
import decodeToken from "../../../service/DecodeJwt";
import AddTopicForm from "./AddTopicForm/AddTopicForm";
import { getClasses } from "../../../service/ClassService";

const PlanComponent = () => {
  let rawUser = useAuth();
  const user = rawUser && rawUser.user ? rawUser.user : rawUser;
  const role = user?.role;
  const token = user?.token || null;

  let lecturerId = "";
  let userId = user?.id || user?.username || "";
  if (token) {
    const decoded = decodeToken(token);
    userId = decoded?.id || userId;
    if (role === "LECTURER") {
      lecturerId = decoded?.id || user?.username || "";
    } else {
      lecturerId = user?.username || user?.id || "";
    }
  }

  const dispatch = useDispatch();
  const { plans, pending, error } = useSelector((state) => state.plan);

  // Lấy danh sách class từ redux (giống SideBar)
  const classesRaw = useSelector((state) => state.class?.classes || []);
  const [selectedClass, setSelectedClass] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [modal, setModal] = useState({ open: false, topic: null });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    getPlansApi(dispatch, token);
  }, [dispatch, token]);

  // Lấy currentSemesterId từ redux (giống SideBar)
  const currentSemesterId = useSelector(
    (state) => state.semester?.currentSemesterId
  );

  useEffect(() => {
    if (currentSemesterId && token) {
      getClasses(currentSemesterId, token, dispatch);
    }
  }, [currentSemesterId, token, dispatch]);

  // Lọc class theo role (sau khi lấy từ redux)
  const classes = useMemo(() => {
    if (!Array.isArray(classesRaw)) return [];
    if (role === "LECTURER") {
      return classesRaw.filter((cls) => cls.lectureId === lecturerId);
    } else {
      return classesRaw.filter((cls) =>
        (cls.groups || []).some(
          (gr) =>
            gr.groupsLeaderId === userId ||
            (Array.isArray(gr.groupStudent) && gr.groupStudent.includes(userId))
        )
      );
    }
  }, [classesRaw, role, lecturerId, userId]);

  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].classesId);
    }
    if (
      selectedClass &&
      classes.length > 0 &&
      !classes.some((cls) => cls.classesId === selectedClass)
    ) {
      setSelectedClass(classes[0].classesId);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (role !== "STUDENT" || !selectedClass || classes.length === 0) {
      setCurrentGroupId("");
      return;
    }
    const cls = classes.find((c) => c.classesId === selectedClass);
    if (!cls) {
      setCurrentGroupId("");
      return;
    }
    const found = (cls.groups || []).find(
      (gr) =>
        gr.groupsLeaderId === userId ||
        (Array.isArray(gr.groupStudent) && gr.groupStudent.includes(userId))
    );

    setCurrentGroupId(found?.groupsId || "");
  }, [role, selectedClass, classes, user, userId]);

  const groupMap = useMemo(() => {
    const map = {};
    classes.forEach((cls) => {
      (cls.groups || []).forEach((gr) => {
        map[gr.groupsId] = {
          ...gr,
          className: cls.classesName,
          classId: cls.classesId,
        };
      });
    });
    return map;
  }, [classes]);

  const filteredTopics = useMemo(() => {
    const safePlans = Array.isArray(plans) ? plans : [];
    if (!selectedClass) return [];
    if (role === "LECTURER") {
      return safePlans.filter(
        (t) => groupMap[t.groupId]?.classId === selectedClass
      );
    } else {
      if (!currentGroupId) return [];
      return safePlans.filter(
        (t) =>
          t.groupId === currentGroupId &&
          groupMap[t.groupId]?.classId === selectedClass
      );
    }
  }, [role, plans, groupMap, selectedClass, currentGroupId]);

  const getLeaderName = (groupId) => {
    const group = groupMap[groupId];
    return group ? group.groupsLeaderId : "-";
  };
  const getMemberNames = (groupId) => {
    const group = groupMap[groupId];
    return group && group.groupStudent && group.groupStudent.length > 0
      ? group.groupStudent.join(", ")
      : "-";
  };
  const getGroupName = (groupId) => {
    const group = groupMap[groupId];
    return group ? group.groupsName : groupId;
  };

  const handleApprove = async (topicId) => {
    setActionLoading(true);
    setLocalError("");
    try {
      await approvePlanApi(topicId, token, dispatch);
      setModal({ open: false, topic: null });
    } catch (err) {
      setLocalError("Lỗi phê duyệt đề tài");
    }
    setActionLoading(false);
  };

  const handleReject = async (topicId) => {
    if (!rejectReason.trim()) {
      setLocalError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setActionLoading(true);
    setLocalError("");
    try {
      await rejectPlanApi(topicId, rejectReason, token, dispatch);
      setModal({ open: false, topic: null });
      setRejectReason("");
    } catch (err) {
      setLocalError("Lỗi từ chối đề tài");
    }
    setActionLoading(false);
  };

  return (
    <div className="plan__component">
      <div className="plan__component__container">
        <div className="plan__component__container__heading">
          <h2>Plan</h2>
        </div>

        {/* STUDENT: Thêm mới đề tài */}
        {role === "STUDENT" &&
          (currentGroupId ? (
            <div className="plan__add-topic-row">
              <AddTopicForm
                classId={selectedClass}
                groupId={currentGroupId}
                token={token}
                dispatch={dispatch}
                disabled={pending}
              />
            </div>
          ) : (
            <div
              style={{ margin: "16px 0", color: "#d32f2f", fontWeight: 500 }}
            >
              Bạn không thuộc nhóm nào trong lớp này hoặc dữ liệu nhóm chưa
              đúng.
              <br />
              (user id: {user?.id || user?.username})
            </div>
          ))}

        <DetailTopicForm
          open={modal.open}
          topic={modal.topic}
          group={modal.topic ? groupMap[modal.topic.groupId] : null}
          role={role}
          actionLoading={actionLoading}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          localError={localError}
          setLocalError={setLocalError}
          onClose={() => setModal({ open: false, topic: null })}
          onApprove={() => handleApprove(modal.topic?.topicId)}
          onReject={() => handleReject(modal.topic?.topicId)}
        />

        {/* {error && <div className="plan__error">{error}</div>} */}

        {/* Chọn lớp */}
        <div className="plan__select-class">
          <label htmlFor="plan-class-select">Chọn lớp:</label>
          <select
            id="plan-class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((cls) => (
              <option key={cls.classesId} value={cls.classesId}>
                {cls.classesName}
              </option>
            ))}
          </select>
        </div>

        {/* Bảng danh sách đề tài đăng ký */}
        <div className="plan__component__container__main__content">
          <div className="table-responsive">
            <table className="plan__table">
              <thead>
                <tr>
                  <th>Nhóm</th>
                  <th>Leader</th>
                  <th>Thành viên</th>
                  <th>Đề tài đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Lý do từ chối</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pending ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      <span className="plan__loading">Đang tải...</span>
                    </td>
                  </tr>
                ) : filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((item, idx) => (
                    <tr key={item.topicId || idx}>
                      <td>{getGroupName(item.groupId)}</td>
                      <td>{getLeaderName(item.groupId)}</td>
                      <td>{getMemberNames(item.groupId)}</td>
                      <td>{item.topicTitle}</td>
                      <td>
                        <span
                          className={`plan__modal-status plan__modal-status--${(
                            item.status || ""
                          ).toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === "Rejected" ? item.rejectReason : "-"}
                      </td>
                      <td>
                        <button
                          className="plan__btn-detail"
                          onClick={() => {
                            setModal({ open: true, topic: item });
                            setRejectReason("");
                            setLocalError("");
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComponent;
