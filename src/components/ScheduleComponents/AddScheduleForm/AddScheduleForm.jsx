import { useState } from 'react';
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
  console.log(isPage);
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.class);
  const groupList = useSelector((state) => state.group.groups);
  const [selectedClasses, setSelectedClasses] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [scheduleData, setScheduleData] = useState({
    slotTitle: '',
    slotDescription: '',
    slotStarTime: '',
    groupId: '',
    assignTo: '',
  });

  const getGroup = () => {
    const group = groupList.find((g) => g.groupsId === groupId);
    return group;
  };
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

    const fullDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();

    if (isNaN(fullDateTime.getTime())) {
      toast.error('Invalid date or time format!');
      return false;
    }

    if (fullDateTime < now) {
      toast.error('Start time must be in the future!');
      return false;
    }

    return true;
  };

  // Submit for groups
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    // ensure group selected when required
    if (!isGroup(isPage, selectedGroup)) {
      toast.error('Please select a group!');
      return;
    }
    if (!date || !time) {
      toast.error('All input are required!');
      return;
    }

    const fullDateTime = `${date}T${time}:00`;

    // normalize userIdAssigns similar to ScheduleService
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
        return input.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const fallbackGroup = getGroup();
    const studentObjs = selectedGroup?.groupStudents ?? fallbackGroup?.groupStudents ?? [];
    const idsFromStudents = studentObjs
      .map((s) => (typeof s === 'string' ? s : s.userId || s._id || s.id || s.work_id))
      .filter(Boolean);

    const idsFromForm = normalizeUserIdAssigns(scheduleData.userIdAssigns || scheduleData.assignTo);

    const userIdAssigns = idsFromForm.length ? idsFromForm : idsFromStudents;

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

  // Submit for current group

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <form className="add-schedule-form" onSubmit={handleSubmit}>
          <h3>Add new slot</h3>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column' }}
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

            {/* Hiển thị lớp đã chọn */}
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

            {/* Hiển thị group đã chọn */}
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
