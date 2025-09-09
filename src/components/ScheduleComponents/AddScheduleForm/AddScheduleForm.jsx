import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import './AddScheduleForm.scss';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthProvider';
import { useSelector } from 'react-redux';
import { addSlotByGroup } from '../../../service/ScheduleService';
import { useDispatch } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { isGroup } from '../../../helper/validateStudentGroup';
const AddScheduleForms = ({ groupId, onClose, onSuccess, isPage }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.class);
  const groupList = useSelector((state) => state.group.groups);
  const [selectedClasses, setSelectedClasses] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const bufferMinutesDefault = 2;

  const getBufferedDateTimeStrings = (bufferMinutes = bufferMinutesDefault) => {
    const now = new Date();
    const target = new Date(now.getTime() + bufferMinutes * 60 * 1000);

    let candidate = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
      target.getHours(),
      target.getMinutes(),
      0,
      0,
    );
    if (candidate.getTime() < target.getTime()) {
      candidate = new Date(candidate.getTime() + 60 * 1000);
    }

    const yyyy = candidate.getFullYear();
    const mm = String(candidate.getMonth() + 1).padStart(2, '0');
    const dd = String(candidate.getDate()).padStart(2, '0');
    const hh = String(candidate.getHours()).padStart(2, '0');
    const mi = String(candidate.getMinutes()).padStart(2, '0');

    return { dateStr: `${yyyy}-${mm}-${dd}`, timeStr: `${hh}:${mi}` };
  };

  const { dateStr, timeStr } = getBufferedDateTimeStrings();
  const [date, setDate] = useState(dateStr);
  const [time, setTime] = useState(timeStr);
  const [scheduleData, setScheduleData] = useState({
    slotTitle: '',
    slotDescription: '',
    slotStarTime: '',
    groupId: '',
    assignTo: '',
  });
  const [studentsList, setStudentsList] = useState([]); // [{id, full_name, avatar}]
  const [selectedAssigns, setSelectedAssigns] = useState([]);
  const [showStudentsPanel, setShowStudentsPanel] = useState(false);
  const studentsPanelRef = useRef(null);

  const getGroup = () => {
    const group = groupList.find((g) => g.groupsId === groupId);
    return group;
  };

  // load student user details when group changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const fallbackGroup = getGroup();
      const studentObjs = selectedGroup?.groupStudents ?? fallbackGroup?.groupStudents ?? [];

      const ids = studentObjs
        .map((s) => (typeof s === 'string' ? s : s.userId || s._id || s.id || s.work_id))
        .filter(Boolean);

      if (ids.length === 0) {
        if (mounted) {
          setStudentsList([]);
          setSelectedAssigns([]);
        }
        return;
      }

      try {
        const promises = ids.map((id) =>
          axios
            .get(`http://103.166.183.142:8080/api/profile/user/${id}`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            })
            .then((res) => res.data?.user ?? res.data)
            .catch(() => null),
        );

        const results = await Promise.all(promises);
        const list = results
          .map((u, i) => ({ id: ids[i], user: u }))
          .filter((x) => x.user)
          .map((x) => ({
            id: x.id,
            full_name: x.user?.full_name || x.user?.name || x.id,
            avatar: x.user?.avatar,
          }));

        if (mounted) {
          setStudentsList(list);
          // default: select all students
          setSelectedAssigns(list.map((s) => s.id));
        }
      } catch (e) {
        // ignore; keep empty
        if (mounted) {
          setStudentsList([]);
          setSelectedAssigns([]);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [selectedGroup, groupList, user]);

  // close students panel when clicking outside
  useEffect(() => {
    if (!showStudentsPanel) return;
    const handleOutside = (e) => {
      if (
        studentsPanelRef.current &&
        !studentsPanelRef.current.contains(e.target) &&
        !e.target.closest('.students-label') &&
        !e.target.closest('.add-member-box')
      ) {
        setShowStudentsPanel(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showStudentsPanel]);
  const handleSelectClass = (e) => {
    const classId = e.target.value;
    const classChoose = classes.find((c) => c.classesId === classId);
    setSelectedClasses(classChoose);
  };

  const handleSelectGroup = (e) => {
    const groupsId = e.target.value;

    const classObj = classes.find(
      (c) => String(c.classesId) === String(selectedClasses?.classesId),
    );
    if (!classObj) {
      setSelectedGroup(null);
      return;
    }

    const group = classObj.groups.find((g) => String(g.groupsId) === String(groupsId));
    setSelectedGroup(group);
  };

  const handleRemoveSelectedGroup = () => {
    setSelectedGroup(null);
  };

  const handleRemoveSelectedClass = () => {
    setSelectedClasses(null);
    setSelectedGroup(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!isGroup(isPage, selectedGroup)) toast.error('Please selected group!');

    if (!scheduleData.slotTitle.trim()) {
      toast.error('Slot title is required!');
      return false;
    }

    if (!scheduleData.slotDescription.trim()) {
      toast.error('Slot description is required!');
      return false;
    }

    if (!date || !time) {
      toast.error('Date and time are required!');
      return false;
    }

    let effectiveDate = date;
    let effectiveTime = time;
    if (date === dateStr && time === timeStr) {
      const refreshed = getBufferedDateTimeStrings();
      effectiveDate = refreshed.dateStr;
      effectiveTime = refreshed.timeStr;
    }

    const [y, m, d] = effectiveDate.split('-').map(Number);
    const [hh, mm] = effectiveTime.split(':').map(Number);
    const fullDateTime = new Date(y, m - 1, d, hh, mm, 0, 0);
    const now = new Date();
    const bufferMinutes = bufferMinutesDefault;

    const toleranceMs = 30 * 1000;
    const minAllowed = new Date(now.getTime() + bufferMinutes * 60 * 1000 - toleranceMs);

    if (isNaN(fullDateTime.getTime())) {
      toast.error('Invalid date or time format!');
      return false;
    }

    if (fullDateTime < minAllowed) {
      toast.error(`Start time must be at least ${bufferMinutes} minutes in the future!`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isGroup(isPage, selectedGroup)) {
      toast.error('Please select a group!');
      return;
    }
    if (!date || !time) {
      toast.error('All input are required!');
      return;
    }

    let finalDate = date;
    let finalTime = time;
    if (date === dateStr && time === timeStr) {
      const refreshed = getBufferedDateTimeStrings();
      finalDate = refreshed.dateStr;
      finalTime = refreshed.timeStr;
    }
    const fullDateTime = `${finalDate}T${finalTime}:00`;

    const normalizeUserIdAssigns = (input) => {
      if (Array.isArray(input)) {
        return input
          .map((u) => {
            if (!u) return null;
            if (typeof u === 'string') return u;
            return u.userId || u._id || u.id || u.work_id || null;
          })
          .filter(Boolean);
      }
      if (typeof input === 'string' && input.length) {
        return input
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const fallbackGroup = getGroup();
    const studentObjs = selectedGroup?.groupStudents ?? fallbackGroup?.groupStudents ?? [];
    const idsFromStudents = studentObjs
      .map((s) => (typeof s === 'string' ? s : s.userId || s._id || s.id || s.work_id))
      .filter(Boolean);

    const idsFromForm = normalizeUserIdAssigns(scheduleData.userIdAssigns || scheduleData.assignTo);

    // if user selected assigns via UI, prefer those
    const userIdAssigns = selectedAssigns.length
      ? selectedAssigns
      : idsFromForm.length
      ? idsFromForm
      : idsFromStudents;

    const payload = {
      slotTitle: scheduleData.slotTitle || '',
      slotDescription: scheduleData.slotDescription || '',
      slotStartTime: scheduleData.slotStartTime || fullDateTime || scheduleData.slotStarTime || '',
      groupId: scheduleData.groupId || selectedGroup?.groupsId || groupId || '',
      userIdAssigns,
    };

    console.log('AddSchedule payload:', payload);
    try {
      const res = await addSlotByGroup(user.token, payload, dispatch);
      console.log('AddSchedule response:', res);
      toast.success('Added slot successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to add slot', err);
      toast.error(err?.message || 'Failed to add slot');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <form className="add-schedule-form" onSubmit={handleSubmit}>
          <h3>Add new slot</h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexDirection: 'column',
            }}
          >
            {isPage && (
              <div className="select-wrapper">
                <select onChange={handleSelectClass} value={selectedClasses?.classesId || ''}>
                  <option value="">-- Choose Classes --</option>
                  {classes.map((item) => (
                    <option key={item.classesId} value={item.classesId}>
                      {item.classesName}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedGroup?.groupsId || ''}
                  onChange={handleSelectGroup}
                  required
                  disabled={!selectedClasses}
                >
                  <option value="">-- Choose Group --</option>
                  {selectedClasses?.groups.map((group) => (
                    <option key={group.groupsId} value={group.groupsId}>
                      {group.groupsName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hiển thị lớp và group đã chọn */}
            {isPage && selectedClasses && (
              <div className="selected-group" style={{ marginTop: 8 }}>
                <span>
                  Class: <b>{selectedClasses.classesName}</b>
                </span>
                <button type="button" className="remove-btn" onClick={handleRemoveSelectedClass}>
                  <FaTrash />
                </button>
              </div>
            )}

            {isPage && selectedGroup && (
              <div className="selected-group" style={{ marginTop: 8 }}>
                <span>
                  Group: <b>{selectedGroup.groupsName}</b>
                </span>
                <button type="button" className="remove-btn" onClick={handleRemoveSelectedGroup}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="slotTitle">📌 Title:</label>
            <input
              type="text"
              id="slotTitle"
              name="slotTitle"
              value={scheduleData.slotTitle}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="slotDescription">📝 Description:</label>
            <textarea
              id="slotDescription"
              name="slotDescription"
              rows="2"
              value={scheduleData.slotDescription}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">📅 Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time */}
          <div className="form-group">
            <label htmlFor="time">🕒 Start Time:</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {/* Students checklist (moved below Start Time) */}
          {studentsList.length > 0 && (
            <div className={`form-group students-checklist ${showStudentsPanel ? 'open' : ''}`}>
              <label
                className="students-label"
                onClick={() => setShowStudentsPanel((s) => !s)}
                style={{ cursor: 'pointer' }}
              >
                Assign to:
              </label>

              <div className="students-controls-row">
                <div className="selected-members">
                  {selectedAssigns.length === 0 ? (
                    <div className="no-selected">No member selected</div>
                  ) : (
                    selectedAssigns.map((id) => {
                      const s = studentsList.find((x) => x.id === id) || {};
                      return (
                        <div key={id} className="member-pill">
                          <img
                            src={s.avatar || ''}
                            alt={s.full_name}
                            onError={(e) =>
                              (e.target.src =
                                'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg')
                            }
                          />
                          <span className="pill-name">{s.full_name || id}</span>
                          <button
                            type="button"
                            className="pill-remove"
                            onClick={() => setSelectedAssigns((p) => p.filter((i) => i !== id))}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* dashed Add Member box (full width) */}
                <div
                  role="button"
                  tabIndex={0}
                  className={`add-member-box ${showStudentsPanel ? 'open' : ''}`}
                  onClick={() => setShowStudentsPanel((s) => !s)}
                  onKeyDown={(e) => e.key === 'Enter' && setShowStudentsPanel((s) => !s)}
                  aria-label="Open member selector"
                >
                  <div className="plus">+</div>
                  <div className="add-text">Add Member</div>
                </div>
              </div>
              {showStudentsPanel && (
                <div
                  ref={studentsPanelRef}
                  className="students-panel"
                  role="dialog"
                  aria-label="Select members"
                >
                  {studentsList.map((s) => (
                    <div key={s.id} className="students-row">
                      <label className="student-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAssigns.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAssigns((p) => [...p, s.id]);
                            else setSelectedAssigns((p) => p.filter((id) => id !== s.id));
                          }}
                        />
                      </label>
                      <img
                        src={s.avatar || ''}
                        alt={s.full_name}
                        className="student-avatar"
                        onError={(e) =>
                          (e.target.src =
                            'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg')
                        }
                      />
                      <div className="student-name">{s.full_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button type="submit">
            <FaPlus />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleForms;
