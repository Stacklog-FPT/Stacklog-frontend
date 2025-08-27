import React, { useEffect, useMemo, useState } from "react";
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
import { FiFilter, FiSearch, FiRefreshCcw } from "react-icons/fi";

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  return <span className={`sl-badge sl-badge--${s}`}>{status || "-"}</span>;
};

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
  const { plans, pending } = useSelector((state) => state.plan);

  // classes
  const classesRaw = useSelector((state) => state.class?.classes || []);
  const [selectedClass, setSelectedClass] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState("");

  // modal/detail
  const [modal, setModal] = useState({ open: false, topic: null });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  // Thêm state để mở modal AddTopicForm
  const [addOpen, setAddOpen] = useState(false);

  // toolbar state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    getPlansApi(dispatch, token);
  }, [dispatch, token]);

  const currentSemesterId = useSelector(
    (state) => state.semester?.currentSemesterId
  );

  useEffect(() => {
    if (currentSemesterId && token) {
      getClasses(currentSemesterId, token, dispatch);
    }
  }, [currentSemesterId, token, dispatch]);

  // role-based class list
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

  // default/select class
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

  // resolve current group for STUDENT
  useEffect(() => {
    if (role !== "STUDENT" || !selectedClass || classes.length === 0) {
      setCurrentGroupId("");
      return;
    }
    const cls = classes.find((c) => c.classesId === selectedClass);
    if (!cls) return setCurrentGroupId("");

    const found = (cls.groups || []).find(
      (gr) =>
        gr.groupsLeaderId === userId ||
        (Array.isArray(gr.groupStudent) && gr.groupStudent.includes(userId))
    );
    setCurrentGroupId(found?.groupsId || "");
  }, [role, selectedClass, classes, userId]);

  // group map
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

  // filtered topics (class → status → keyword)
  const filteredTopics = useMemo(() => {
    const safePlans = Array.isArray(plans) ? plans : [];
    if (!selectedClass) return [];

    let list =
      role === "LECTURER"
        ? safePlans.filter(
            (t) => groupMap[t.groupId]?.classId === selectedClass
          )
        : currentGroupId
        ? safePlans.filter(
            (t) =>
              t.groupId === currentGroupId &&
              groupMap[t.groupId]?.classId === selectedClass
          )
        : [];

    if (statusFilter !== "ALL") {
      list = list.filter((t) => (t.status || "") === statusFilter);
    }

    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.topicTitle?.toLowerCase().includes(k) ||
          t.topicDescription?.toLowerCase().includes(k) ||
          t.topicObjective?.toLowerCase().includes(k) ||
          groupMap[t.groupId]?.groupsName?.toLowerCase().includes(k)
      );
    }

    // sort by registerAt desc
    return list.slice().sort((a, b) => {
      const ta = new Date(a.registerAt || 0).getTime();
      const tb = new Date(b.registerAt || 0).getTime();
      return tb - ta;
    });
  }, [
    role,
    plans,
    groupMap,
    selectedClass,
    currentGroupId,
    statusFilter,
    keyword,
  ]);

  const getLeaderName = (groupId) => groupMap[groupId]?.groupsLeaderId || "-";
  const getMemberNames = (groupId) =>
    (groupMap[groupId]?.groupStudent || []).length
      ? groupMap[groupId].groupStudent.join(", ")
      : "-";
  const getGroupName = (groupId) => groupMap[groupId]?.groupsName || groupId;

  const handleApprove = async (topicId) => {
    setActionLoading(true);
    setLocalError("");
    try {
      const oldPlan = plans.find((p) => p.topicId === topicId);
      if (!oldPlan) {
        setLocalError("Không tìm thấy đề tài!");
        setActionLoading(false);
        return;
      }
      const payload = {
        ...oldPlan,
        status: "Approved",
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
        rejectReason: null,
      };
      await approvePlanApi(topicId, payload, token, dispatch);
      setModal({ open: false, topic: null });
    } catch {
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
      const oldPlan = plans.find((p) => p.topicId === topicId);
      if (!oldPlan) {
        setLocalError("Không tìm thấy đề tài!");
        setActionLoading(false);
        return;
      }
      const payload = {
        ...oldPlan,
        status: "Rejected",
        rejectReason,
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
      };
      await rejectPlanApi(topicId, payload, token, dispatch);
      setModal({ open: false, topic: null });
      setRejectReason("");
    } catch {
      setLocalError("Lỗi từ chối đề tài");
    }
    setActionLoading(false);
  };

  const refresh = () => getPlansApi(dispatch, token);

  return (
    <div className="plan">
      <div className="plan__header">
        <h2>Topic</h2>
        <div className="plan__actions">
          {/* Thay nút làm mới bằng nút đăng ký đề tài mới */}
          {role === "STUDENT" && currentGroupId && (
            <button
              className="sl-btn sl-btn--primary"
              onClick={() => setAddOpen(true)}
              disabled={pending}
              type="button"
            >
              <i class="fa-solid fa-plus"></i>Topic
            </button>
          )}
        </div>
      </div>

      <div className="plan__toolbar">
        <div className="plan__field">
          <label>Lớp</label>
          <select
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

        <div className="plan__field">
          <label></label>
          <div className="sl-select">
            <FiFilter className="sl-select__icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="plan__search">
          <FiSearch />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by group / title / description…"
          />
        </div>

        <div className="plan__count">
          {pending ? "Đang tải…" : `${filteredTopics.length} kết quả`}
        </div>
      </div>

      {/* STUDENT: Thêm mới đề tài */}
      {role === "STUDENT" && currentGroupId && (
        <AddTopicForm
          classId={selectedClass}
          groupId={currentGroupId}
          token={token}
          dispatch={dispatch}
          disabled={pending}
          // Điều khiển mở/đóng modal qua prop open/close
          open={addOpen}
          setOpen={setAddOpen}
        />
      )}
      {role === "STUDENT" && !currentGroupId && (
        <div className="sl-alert sl-alert--danger">
          Bạn không thuộc nhóm nào trong lớp này hoặc dữ liệu nhóm chưa đúng.
          <div className="sl-alert__sub">
            (user id: {user?.id || user?.username})
          </div>
        </div>
      )}

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

      <div className="sl-table-wrap">
        <table className="sl-table">
          <thead>
            <tr>
              <th>Nhóm</th>
              <th>Leader</th>
              <th>Thành viên</th>
              <th>Đề tài</th>
              <th>Trạng thái</th>
              <th>Lý do từ chối</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {pending ? (
              <tr>
                <td colSpan={7}>
                  <div className="sl-skeleton-row" />
                  <div className="sl-skeleton-row" />
                  <div className="sl-skeleton-row" />
                </td>
              </tr>
            ) : filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="sl-empty">
                    Không có dữ liệu phù hợp bộ lọc hiện tại.
                  </div>
                </td>
              </tr>
            ) : (
              filteredTopics.map((item) => (
                <tr key={item.topicId}>
                  <td className="sl-cell-strong">
                    {getGroupName(item.groupId)}
                  </td>
                  <td>{getLeaderName(item.groupId)}</td>
                  <td className="sl-cell-muted">
                    {getMemberNames(item.groupId)}
                  </td>
                  <td>
                    <div className="sl-topic">
                      <div className="sl-topic__title">{item.topicTitle}</div>
                      {(item.topicAbbreviation || item.registerAt) && (
                        <div className="sl-topic__meta">
                          {item.topicAbbreviation && (
                            <span className="sl-kbd">
                              {item.topicAbbreviation}
                            </span>
                          )}
                          {item.registerAt && (
                            <span className="sl-dot">
                              {new Date(item.registerAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="sl-cell-muted">
                    {item.status === "Rejected" ? item.rejectReason : "—"}
                  </td>
                  <td>
                    <button
                      className="sl-btn sl-btn--primary sl-btn--sm"
                      onClick={() => {
                        setModal({ open: true, topic: item });
                        setRejectReason("");
                        setLocalError("");
                      }}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanComponent;
