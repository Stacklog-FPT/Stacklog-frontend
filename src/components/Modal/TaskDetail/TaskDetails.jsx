import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./TaskDetail.scss";
import { useDispatch, useSelector } from "react-redux";
import CommentBody from "../../Task/CommentTask/CommentBody";
import CommentFooter from "../../Task/CommentTask/CommentFooter";
import { formatDateUI } from "../../../helper/formatDate";
import { useAuth } from "../../../context/AuthProvider";
import axios from "axios";
import { createReview } from "../../../service/ReviewService";
import ReviewService from "../../../service/ReviewService";
import decodeToken from "../../../service/DecodeJwt";
import { MdModeEditOutline } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import Navbar from "./Navbar/Navbar";
import Checklist from "./Checklist/Checklist";
import SubTask from "./SubTask/SubTask";
import HoldDeleteButton from "./ButtonDelete";
import { deleteTaskApi, updateTaskApi } from "../../../service/TaskService";
import userApi, { fetchUserById } from "../../../service/UserService";
import { toast } from "sonner";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import { useParams } from "react-router-dom";

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};
const toISO = (localValue) =>
  localValue ? new Date(localValue).toISOString() : null;

const TaskDetails = ({ taskId, onClose }) => {
  const statuses = useSelector((state) => state.status.statuses);
  const task = useSelector((state) =>
    state.task.tasks.find((t) => t.taskId === taskId)
  );
  const { classes } = useSelector((state) => state.class);
  const currentStatus = statuses.find(
    (s) => String(s?.statusTaskId) === String(task?.statusTaskId)
  );

  const [isAssignDirty, setIsAssignDirty] = useState(false);
  const { groupId } = useParams();
  // -- Get User by id --
  const [studentInformation, setStudentInformation] = useState([]);
  // --- EDIT MODE STATE ---
  const [editTask, setEditTask] = useState(false);
  const [isChecklistDirty, setChecklistDirty] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const groups = useSelector((state) => state.group.groups);
  const currentGroup = groupId
    ? groups.find((g) => g.groupsId === groupId)
    : "";
  const currentGroupUi = groups.find((g) => g.groupsId === task?.groupId);

  const filteredClasses = classes.find((cls) =>
    cls.groups.some((group) => group?.groupsId === currentGroupUi?.groupsId)
  );
  const [form, setForm] = useState({
    title: task?.taskTitle || "",
    description: task?.taskDescription || "",
    startLocal: toLocalInput(task?.taskStartTime),
    dueLocal: toLocalInput(task?.taskDueDate),
    checkListDraft: Array.isArray(task?.checkLists) ? task.checkLists : [],
    assignTo: Array.isArray(task?.assignTo)
      ? task.assignTo.map((item) =>
          typeof item === "string" ? item : item.userId || item._id
        )
      : [],
  });

  // comment state
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const panelRef = useRef(null);
  const { user } = useAuth();
  const decoded = decodeToken(user.token);
  const dispatch = useDispatch();
  const { deleteReview } = ReviewService();
  const [activeTab, setActiveTab] = useState("subtasks");
  useEffect(() => {
    setForm({
      title: task?.taskTitle || "",
      description: task?.taskDescription || "",
      startLocal: toLocalInput(task?.taskStartTime),
      dueLocal: toLocalInput(task?.taskDueDate),
      checkListDraft: Array.isArray(task?.checkLists) ? task.checkLists : [],
      assignTo: Array.isArray(task?.assignTo)
        ? task.assignTo.map((item) =>
            typeof item === "string" ? item : item.userId || item._id
          )
        : [],
    });
    setChecklistDirty(false);
    setShowAssignDropdown(false);
  }, [task]);

  const handleFormChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAssignChange = (e) => {
    const { checked, value } = e.target;

    setForm((prev) => {
      const newAssigns = checked
        ? [...prev.assignTo, value]
        : prev.assignTo.filter((id) => id !== value);

      return { ...prev, assignTo: newAssigns };
    });

    setIsAssignDirty(true);
  };

  const handleRemoveAssign = (userId) => {
    setForm((prev) => ({
      ...prev,
      assignTo: prev.assignTo.filter((id) => id !== userId),
    }));

    setIsAssignDirty(true);
  };

  const selectedMembers = Array.isArray(studentInformation)
    ? studentInformation.filter(
        (m) => m && m._id && form.assignTo.includes(m._id)
      )
    : [];

  const handleToggleEdit = async () => {
    if (!editTask) {
      setEditTask(true);
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();
    const startISO = toISO(form.startLocal);
    const dueISO = toISO(form.dueLocal);
    if (startISO && dueISO && new Date(dueISO) < new Date(startISO)) {
      toast.error("Due date must greater than start date");
      return;
    }

    const payload = {
      ...task,
      taskTitle: title || task.taskTitle,
      taskDescription: description || task.taskDescription,
      taskStartTime: startISO || task.taskStartTime,
      taskDueDate: dueISO || task.taskDueDate,
      checkLists: form.checkListDraft,
      listUserAssign: isAssignDirty ? form.assignTo : task.assignTo,
    };

    const res = await updateTaskApi(payload, user.token, dispatch);
    if (res?.status === 200 || res?.data || res === true) {
      toast.success("Updated task successfully!");
      setEditTask(false);
      setChecklistDirty(false);
    } else {
      toast.error("Oops, something went wrong!");
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = {
        ...task,
        reviews: [
          ...task?.reviews,
          {
            reviewContent: newComment,
            createdBy: decoded.id,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      const res = await updateTaskApi(payload, user?.token, dispatch);
      if (res) {
        setNewComment("");
        await axios.post("http://localhost:3000/notifications", {
          id: Math.random().toString(16).slice(2, 6),
          title: `Comment by ${user.username}`,
          author: {
            _id: Math.random(),
            name: user.username || "Unknown",
            avatar:
              user.avatar ||
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
          },
          createdAt: new Date().toISOString().split("T")[0],
          isRead: false,
          _id: Math.random(),
        });
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleEditComment = (item) => {
    setEditingCommentId(item.reviewId);
    setEditedComment(item.reviewContent);
  };

  const handleUpdateComment = async () => {
    if (!editedComment.trim()) return;
    try {
      const reviews = task?.reviews || [];
      const payload = {
        ...task,
        reviews: reviews.map((r) =>
          r.reviewId === editingCommentId
            ? { ...r, reviewContent: editedComment }
            : r
        ),
      };
      const res = await createReview(user?.token, task.id, payload, dispatch);
      if (res) {
        setEditingCommentId(null);
        setEditedComment("");
      }
    } catch (e) {
      console.error("Update failed:", e.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteReview(user.token, commentId);
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleDeleteTask = async () => {
    const response = await deleteTaskApi(user.token, task.taskId, dispatch);
    if (response?.status === 200) {
      toast.success("Delete task successfully!");
      onClose();
    } else {
      toast.error("Oops, something went wrong!");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (editTask) {
          setEditTask(false);
          setForm({
            title: task?.taskTitle || "",
            description: task?.taskDescription || "",
            startLocal: toLocalInput(task?.taskStartTime),
            dueLocal: toLocalInput(task?.taskDueDate),
            checkListDraft: Array.isArray(task?.checkLists)
              ? task.checkLists
              : [],
            assignTo: Array.isArray(task?.assignTo)
              ? task.assignTo.map((item) =>
                  typeof item === "string" ? item : item.userId || item._id
                )
              : [],
          });
          setChecklistDirty(false);
          setShowAssignDropdown(false);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editTask, onClose, task]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      let userIds = [];

      if (editTask) {
        if (
          !currentGroup?.groupStudents ||
          currentGroup.groupStudents.length === 0
        ) {
          setStudentInformation([]);
          return;
        }
        userIds = currentGroup.groupStudents.map((item) => item.userId);
      } else {
        if (!task?.assignTo || task.assignTo.length === 0) {
          setStudentInformation([]);
          return;
        }
        userIds = task.assignTo
          .map((item) =>
            typeof item === "string" ? item : item.userId || item._id
          )
          .filter(Boolean);
      }

      const studentInfos = await Promise.all(
        userIds.map(async (id) => {
          try {
            const u = await fetchUserById(user.token, id);
            if (!u?._id) return null;
            return {
              _id: u._id,
              name: u.full_name || "Unknown",
              avatar: u.avatar_link,
            };
          } catch (err) {
            console.warn("User not found:", id);
            return null;
          }
        })
      );

      setStudentInformation(studentInfos.filter(Boolean));
    };

    fetchStudent();
  }, [
    task?.assignTo,
    task?.taskId,
    editTask,
    user.token,
    currentGroup?.groupStudents,
  ]);

  const handleBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  return ReactDOM.createPortal(
    <div className="taskdetail__root">
      <div className="taskdetail__backdrop" onMouseDown={handleBackdropClick} />
      <aside
        ref={panelRef}
        className="taskdetail__panel"
        role="dialog"
        aria-modal="true"
      >
        {/* Title Task */}
        <header className="taskdetail__header">
          <div className="taskdetail__title">
            <span className="taskdetail__pill">
              {task?.priority || "NORMAL"}
            </span>

            {editTask ? (
              <input
                className="taskdetail__titleInput"
                value={form.title}
                onChange={handleFormChange("title")}
                placeholder="Task title"
                autoFocus
              />
            ) : (
              <h2 title={task?.taskTitle}>
                {task?.taskTitle || "Untitled task"}
              </h2>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="taskdetail__edit"
              onClick={handleToggleEdit}
              title={editTask ? "Lưu" : "Chỉnh sửa"}
              aria-pressed={editTask}
            >
              {editTask ? (
                <FaCheck
                  size={15}
                  color={isChecklistDirty ? "#b91c1c" : "#045745"}
                />
              ) : (
                <MdModeEditOutline size={20} color="#045745" />
              )}
              {editTask && isChecklistDirty && <span className="unsaved-dot" />}
            </button>

            <HoldDeleteButton onConfirm={handleDeleteTask} />

            <button
              className="taskdetail__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        {/* Meta: Status / Start / Due */}
        <section className="taskdetail__meta">
          <div>
            <label>Status</label>
            <p>{currentStatus?.statusTaskName ?? "-"}</p>
          </div>

          <div>
            <label>Start</label>
            {editTask ? (
              <input
                type="datetime-local"
                className="taskdetail__dt"
                value={form.startLocal}
                onChange={handleFormChange("startLocal")}
                max={form.dueLocal || undefined}
              />
            ) : (
              <p>{formatDateUI(task?.taskStartTime)}</p>
            )}
          </div>

          <div>
            <label>Due</label>
            {editTask ? (
              <input
                type="datetime-local"
                className="taskdetail__dt"
                value={form.dueLocal}
                onChange={handleFormChange("dueLocal")}
                min={form.startLocal || undefined}
              />
            ) : (
              <p>{formatDateUI(task?.taskDueDate)}</p>
            )}
          </div>
        </section>

        {/* Description Task */}
        <section className="taskdetail__desc">
          <label>Description</label>

          {editTask ? (
            <textarea
              className="taskdetail__textarea"
              value={form.description}
              onChange={handleFormChange("description")}
              placeholder="Mô tả công việc..."
              rows={5}
            />
          ) : (
            <div className="taskdetail__descbox">
              {task?.taskDescription ? (
                <>{task.taskDescription}</>
              ) : (
                <i>No description</i>
              )}
            </div>
          )}
        </section>

        <section className="taskdetail__desc taskdetail__class-group">
          <label>Class - Group</label>
          <div className="class-group__box">
            <span className="class-badge">{filteredClasses?.classesName}</span>
            <span className="divider">/</span>
            <span className="group-badge">{currentGroupUi?.groupsName}</span>
          </div>
        </section>

        {/* AssignTo Task */}
        <section className="taskdetail__section">
          <label>Assignees</label>
          {editTask ? (
            <div className="taskdetail__assign-edit">
              <div className="assigned-users-list">
                {selectedMembers.map((member) => (
                  <div key={member._id} className="assigned-user-card">
                    <div className="user-info">
                      <div className="avatar-container">
                        <img
                          src={
                            member.avatar ||
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                          }
                          alt={`${member.name}'s Avatar`}
                          className="user-avatar"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                          }}
                        />
                        <div className="check-icon">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      </div>
                      <span className="user-name">{member.name}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-user-btn"
                      onClick={() => handleRemoveAssign(member._id)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-member-section">
                <button
                  type="button"
                  className="add-member-btn"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                >
                  <img
                    src={avatar_add_button || "/placeholder.svg"}
                    alt="add_button_icon"
                  />
                  <span>Add Member</span>
                </button>
              </div>
              {showAssignDropdown && (
                <div className="assign-dropdown">
                  <div className="assign-checkbox-list">
                    {studentInformation
                      .filter((member) => member && member._id)
                      .map((member) => (
                        <label key={member._id} className="member-option">
                          <input
                            type="checkbox"
                            value={member._id}
                            checked={
                              form.assignTo?.includes(member._id) || false
                            }
                            onChange={handleAssignChange}
                          />
                          <div className="member-info">
                            <img
                              src={
                                member.avatar ||
                                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                              }
                              alt={member.name}
                              className="member-avatar"
                              onError={(e) =>
                                (e.target.src =
                                  "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                              }
                            />
                            <span className="member-name">{member.name}</span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="taskdetail__chips">
              {(studentInformation || []).filter(Boolean).map((u) => (
                <span key={u._id} className="chip">
                  {" "}
                  <img
                    src={
                      u.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt={u.name}
                    className="chip-avatar"
                    onError={(e) =>
                      (e.target.src =
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                    }
                  />
                  {u.name || u.full_name || "Unknown User"}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Navbar */}
        <Navbar
          active={activeTab}
          onChange={setActiveTab}
          counts={{
            subtasks: task?.subtasks?.length,
            checklists: (form.checkListDraft || []).length,
            reviews: task?.reviews?.length,
          }}
        />

        <section className="taskdetail__todo">
          {/* SubTask Task */}
          {activeTab === "subtasks" && <SubTask data={task?.subtasks} />}

          {/* Checklist Task */}
          {activeTab === "checklists" && (
            <Checklist
              checkList={task?.checkLists}
              task={task}
              editTask={editTask}
              onChange={(next) =>
                setForm((f) => ({ ...f, checkListDraft: next }))
              }
              onDirtyChange={setChecklistDirty}
            />
          )}

          {/* Comment Task */}
          {activeTab === "reviews" && (
            <div className="taskdetail_comments">
              <div className="comments__inner">
                <CommentBody
                  reviews={task?.reviews}
                  userMap={{ studentInformation }}
                  formatDate={(d) => formatDateUI(d)}
                  decodedId={decoded?.id}
                  editingCommentId={editingCommentId}
                  editedComment={editedComment}
                  onEdit={handleEditComment}
                  onChangeEdited={setEditedComment}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                />
                <CommentFooter
                  avatar={
                    user?.avatar ||
                    "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  }
                  newComment={newComment}
                  onChangeNew={setNewComment}
                  onSend={handleSendComment}
                />
              </div>
            </div>
          )}
        </section>
      </aside>
    </div>,
    document.body
  );
};

export default TaskDetails;
