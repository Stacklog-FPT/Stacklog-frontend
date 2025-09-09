import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DetailTopicForm from "./DetailTopicForm/DetailTopicForm";
import {
  getPlansApi,
  updatePlanApi,
  deletePlanApi,
} from "../../../service/PlanService";
import "./PlanComponent.scss";
import { useAuth } from "../../../context/AuthProvider";
import decodeToken from "../../../service/DecodeJwt";
import { getClasses } from "../../../service/ClassService";
import { FiFilter, FiSearch, FiRefreshCcw } from "react-icons/fi";
import userApi from "../../../service/UserService";

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

  const normalizedPlans = useMemo(() => {
    const arr = Array.isArray(plans) ? plans : [];
    return arr.map((p) => ({
      ...p,

      allowEdit:
        typeof p.allowEdit === "boolean"
          ? p.allowEdit
          : p.status
          ? p.status === "Pending"
          : true,
    }));
  }, [plans]);
  const currentSemesterId = useSelector(
    (state) => state.semester?.currentSemesterId
  );
  const classesRaw = useSelector((state) => state.class?.classes || []);
  const currentClass = classesRaw.filter(
    (clr) => clr.semesterId === currentSemesterId
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState("");

  const [modal, setModal] = useState({ open: false, topic: null });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    getPlansApi(dispatch, token);
  }, [dispatch, token]);

  useEffect(() => {
    if (currentSemesterId && token) {
      getClasses(currentSemesterId, token, dispatch);
    }
  }, [currentSemesterId, token, dispatch]);

  const classes = useMemo(() => {
    if (!Array.isArray(currentClass)) return [];
    if (role === "LECTURER") {
      return currentClass.filter((cls) => cls.lectureId === lecturerId);
    } else {
      const extractStudentIds = (gr) => {
        const raw = gr.groupStudent || gr.groupStudents || [];
        if (!Array.isArray(raw)) return [];
        return raw.map((s) => (typeof s === "string" ? s : s.userId || s));
      };
      return currentClass.filter((cls) =>
        (cls.groups || []).some((gr) => {
          const students = extractStudentIds(gr);
          return gr.groupsLeaderId === userId || students.includes(userId);
        })
      );
    }
  }, [currentClass, role, lecturerId, userId]);

  useEffect(() => {
    if (
      (!selectedClass || !classes.some((c) => c.classesId === selectedClass)) &&
      classes.length > 0
    ) {
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
    if (role !== "STUDENT") {
      setCurrentGroupId("");
      return;
    }

    if (selectedClass && classes.length > 0) {
      const cls = classes.find((c) => c.classesId === selectedClass);
      if (cls) {
        const found = (cls.groups || []).find((gr) => {
          const raw = gr.groupStudent || gr.groupStudents || [];
          const students = Array.isArray(raw)
            ? raw.map((s) => (typeof s === "string" ? s : s.userId || s))
            : [];
          return gr.groupsLeaderId === userId || students.includes(userId);
        });
        if (found) {
          setCurrentGroupId(found.groupsId || "");
          return;
        }
      }
    }

    const foundGlobal = (currentClass || []).reduce((acc, c) => {
      if (acc) return acc;
      const g = (c.groups || []).find((gr) => {
        const raw = gr.groupStudent || gr.groupStudents || [];
        const students = Array.isArray(raw)
          ? raw.map((s) => (typeof s === "string" ? s : s.userId || s))
          : [];
        return gr.groupsLeaderId === userId || students.includes(userId);
      });
      return g ? { group: g, classObj: c } : null;
    }, null);

    if (foundGlobal) {
      setCurrentGroupId(foundGlobal.group.groupsId || "");

      setSelectedClass(foundGlobal.classObj.classesId || selectedClass);
      return;
    }

    setCurrentGroupId("");
  }, [role, selectedClass, classes, userId]);

  const groupMap = useMemo(() => {
    const map = {};
    classes.forEach((cls) => {
      (cls.groups || []).forEach((gr) => {
        const raw = gr.groupStudent || gr.groupStudents || [];
        const groupStudent = Array.isArray(raw)
          ? raw.map((s) => (typeof s === "string" ? s : s.userId || s))
          : [];
        map[gr.groupsId] = {
          ...gr,

          groupStudent,
          className: cls.classesName,
          classId: cls.classesId,
        };
      });
    });
    return map;
  }, [classes]);

  useEffect(() => {
    console.debug("PlanComponent debug:", {
      currentSemesterId,
      classesRawLength: (classesRaw || []).length,
      visibleClassesLength: classes.length,
      selectedClass,
      plansLength: normalizedPlans.length,
    });
  }, [currentSemesterId, classesRaw, classes, selectedClass, normalizedPlans]);

  const { getUserById } = userApi();
  const [userCache, setUserCache] = useState({});

  const fetchUserName = async (id) => {
    if (!id) return "-";
    if (userCache[id]) return userCache[id];
    try {
      const u = await getUserById(token, id);
      const name = u?.full_name || u?.fullName || u?.work_id || id;
      setUserCache((s) => ({ ...s, [id]: name }));
      return name;
    } catch (e) {
      setUserCache((s) => ({ ...s, [id]: id }));
      return id;
    }
  };

  const filteredTopics = useMemo(() => {
    const safePlans = Array.isArray(normalizedPlans) ? normalizedPlans : [];
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

    return list.slice().sort((a, b) => {
      const ta = new Date(a.registerAt || 0).getTime();
      const tb = new Date(b.registerAt || 0).getTime();
      return tb - ta;
    });
  }, [
    role,
    normalizedPlans,
    groupMap,
    selectedClass,
    currentGroupId,
    statusFilter,
    keyword,
  ]);

  const getLeaderName = (groupId) => {
    const id = groupMap[groupId]?.groupsLeaderId;
    return id ? userCache[id] || id : "-";
  };

  const getMemberNames = (groupId) => {
    const arr = groupMap[groupId]?.groupStudent || [];
    if (!arr.length) return "-";
    return arr.map((s) => userCache[s] || s).join(", ");
  };

  useEffect(() => {
    const ids = new Set();
    filteredTopics.forEach((t) => {
      const g = groupMap[t.groupId];
      if (g) {
        if (g.groupsLeaderId) ids.add(g.groupsLeaderId);
        (g.groupStudent || []).forEach((s) => ids.add(s));
      }
    });
    const missing = Array.from(ids).filter((i) => i && !userCache[i]);
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const res = await Promise.all(
        missing.map(async (id) => {
          try {
            const u = await getUserById(token, id);
            return {
              id,
              name: u?.full_name || u?.fullName || u?.work_id || id,
            };
          } catch {
            return { id, name: id };
          }
        })
      );
      if (cancelled) return;
      const map = {};
      res.forEach((r) => (map[r.id] = r.name));
      setUserCache((s) => ({ ...s, ...map }));
    })();
    return () => {
      cancelled = true;
    };
  }, [filteredTopics, groupMap, token]);
  const getGroupName = (groupId) => groupMap[groupId]?.groupsName || groupId;

  const handleApprove = async (topicId) => {
    setActionLoading(true);
    setLocalError("");
    try {
      const oldPlan = normalizedPlans.find((p) => p.topicId === topicId);
      if (!oldPlan) {
        setLocalError("Topic not found!");
        setActionLoading(false);
        return;
      }
      const payload = {
        ...oldPlan,
        status: "Approved",

        allowEdit: false,
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
        rejectReason: null,
      };
      await updatePlanApi(topicId, payload, token, dispatch);
      setModal({ open: false, topic: null });
    } catch {
      setLocalError("Failed to approve topic");
    }
    setActionLoading(false);
  };

  const handleUpdate = async (topicId, updatedFields) => {
    const oldPlan = normalizedPlans.find((p) => p.topicId === topicId);
    if (!oldPlan) {
      setLocalError("Topic not found!");
      return;
    }

    const isGrantAction =
      Object.prototype.hasOwnProperty.call(updatedFields, "allowEdit") &&
      updatedFields.allowEdit === true &&
      updatedFields.status === "Pending";

    if (!isGrantAction) {
      if (!(oldPlan.status === "Pending" && oldPlan.allowEdit === true)) {
        setLocalError(
          "You do not have permission to edit this topic. Please contact the lecturer to request edit rights."
        );
        return;
      }
    }
    setActionLoading(true);
    setLocalError("");
    try {
      const payload = { ...oldPlan, ...updatedFields };
      await updatePlanApi(topicId, payload, token, dispatch);
      setModal({ open: false, topic: null });
    } catch {
      setLocalError("Failed to update topic");
    }
    setActionLoading(false);
  };

  const handleDelete = async (topicId) => {
    const oldPlan = normalizedPlans.find((p) => p.topicId === topicId);
    if (!oldPlan) {
      setLocalError("Topic not found!");
      return;
    }

    if (!(oldPlan.status === "Pending" && oldPlan.allowEdit === true)) {
      setLocalError(
        "Cannot delete topic. Deletion allowed only when topic is Pending and editable."
      );
      return;
    }
    setActionLoading(true);
    setLocalError("");
    try {
      await deletePlanApi(topicId, token, dispatch);
      setModal({ open: false, topic: null });
    } catch {
      setLocalError("Failed to delete topic");
    }
    setActionLoading(false);
  };

  const handleReject = async (topicId) => {
    if (!rejectReason.trim()) {
      setLocalError("Please enter a rejection reason.");
      return;
    }
    setActionLoading(true);
    setLocalError("");
    try {
      const oldPlan = normalizedPlans.find((p) => p.topicId === topicId);
      if (!oldPlan) {
        setLocalError("Topic not found!");
        setActionLoading(false);
        return;
      }
      const payload = {
        ...oldPlan,
        status: "Rejected",

        allowEdit: false,
        rejectReason,
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
      };
      await updatePlanApi(topicId, payload, token, dispatch);
      setModal({ open: false, topic: null });
      setRejectReason("");
    } catch {
      setLocalError("Failed to reject topic");
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
          {/* Add topic handled via sidebar/modal - no inline add button here */}
        </div>
      </div>

      <div className="plan__toolbar">
        <div className="plan__field">
          <label>Class</label>
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
          {pending ? "Loading…" : `${filteredTopics.length} results`}
        </div>
      </div>

      {/* AddTopicForm intentionally removed from this page */}

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
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <div className="sl-table-wrap">
        <table className="sl-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Leader</th>
              <th>Members</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Reject reason</th>
              <th>Details</th>
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
                    No data matches the current filters.
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
                      View
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
