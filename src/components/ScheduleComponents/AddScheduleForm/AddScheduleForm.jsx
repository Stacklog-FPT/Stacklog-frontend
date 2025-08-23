import { useState } from 'react';
import './AddScheduleForm.scss';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthProvider';
import { useSelector } from 'react-redux';
import { addSlotByGroup } from '../../../service/ScheduleService';
import { useDispatch } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { isGroup } from '../../../helper/validateStudentGroup';
const AddScheduleForms = ({ groupId, onClose, isCreated, setIsCreated, onSuccess, isPage }) => {
  const { user } = useAuth();
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
    if (!isGroup(isPage, selectedGroup)) toast.error('Please selected group!');
    if (!date || !time) {
      toast.error('All input are required!');
      return;
    }

    const fullDateTime = `${date}T${time}:00`;
    const payload = {
      ...scheduleData,
      slotStarTime: fullDateTime,
      groupId: selectedGroup?.groupsId || groupId,
      assignTo: selectedGroup?.groupStudent.map((s) => s) || getGroup().groupStudent,
    };

    await addSlotByGroup(user.token, payload, dispatch);
    onSuccess?.();
    onClose();
    setIsCreated(!isCreated);
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPage && (
              <div className="select-wrapper">
                <select onChange={handleSelectClass}>
                  <option>-- Choose Classes --</option>
                  {classes.map((item) => {
                    return (
                      <option key={item.classesId} value={item.classesId}>
                        {item.classesName}
                      </option>
                    );
                  })}
                </select>
                <select value={selectedGroup?.groupsId || ''} onChange={handleSelectGroup} required>
                  <option>-- Choose Group --</option>
                  {selectedClasses?.groups.map((group) => (
                    <option key={group.groupsId} value={group.groupsId}>
                      {group.groupsName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedGroup && isPage && (
              <button
                type="button"
                onClick={handleRemoveSelectedGroup}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'red',
                }}
              >
                <FaTrash />
              </button>
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
