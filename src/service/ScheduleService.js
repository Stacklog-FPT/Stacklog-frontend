import axios from 'axios';
import {
  getSchedules,
  setError,
  setPending,
  resetSchedule,
  addSchedules,
  deleteSchedules,
  updateSchedules,
} from '../redux/slice/scheduleSlice';

const SCHEDULE_API = REACT_API_URL + 'schedule';

// Helper: normalize various forms of user assignments into an array of id strings
const normalizeUserIdAssigns = (maybeIds) => {
  if (!maybeIds) return [];
  if (Array.isArray(maybeIds)) {
    return maybeIds
      .map((u) => {
        if (!u) return null;
        if (typeof u === 'string') return u;
        // common id fields
        return u.userId || u._id || u.id || u.work_id || null;
      })
      .filter(Boolean);
  }

  if (typeof maybeIds === 'string') {
    // comma separated string
    return maybeIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // single object
  if (typeof maybeIds === 'object') {
    return [maybeIds.userId || maybeIds._id || maybeIds.id || maybeIds.work_id].filter(Boolean);
  }

  return [];
};

// Public API
export const getScheduleByGroupId = async (token, groupId, dispatch) => {

    const userIdAssigns = normalizeUserIdAssigns(
      data.userIdAssigns || data.assignTo || data.userAssigns,
    );

    const payload = {
      slotTitle: data.slotTitle || data.title || '',
      slotDescription: data.slotDescription || data.description || '',
      // accept slotStartTime, legacy slotStarTime, or Date objects
      slotStartTime:
        data.slotStartTime ||
        data.slotStarTime ||
        (data.start ? new Date(data.start).toISOString() : ''),
      groupId: data.groupId || data.group || '',
      userIdAssigns,
    };

    const response = await axios.post(`${SCHEDULE_API}/save`, payload, {
    const response = await axios.post(`http://localhost:3001/schedule`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // assume backend returns created/updated slot(s)
    dispatch(addSchedules(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || 'Failed to add slot'));
    throw e;
  }
};

export const updateScheduleSlot = async (token, slotId, slotData, dispatch) => {
  try {
    if (!token) throw new Error('Token is missing!');
    dispatch(setPending(true));

    const userIdAssigns = normalizeUserIdAssigns(
      slotData.userIdAssigns || slotData.assignTo || slotData.userAssigns,
    );

    const payload = {
      slotId: slotId || slotData.slotId || slotData.id || '',
      slotTitle: slotData.slotTitle || slotData.title || '',
      slotDescription: slotData.slotDescription || slotData.description || '',
      slotStartTime:
        slotData.slotStartTime ||
        slotData.slotStarTime ||
        (slotData.start ? new Date(slotData.start).toISOString() : ''),
      groupId: slotData.groupId || slotData.group || '',
      userIdAssigns,
    };

    const response = await axios.post(`${SCHEDULE_API}/save`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch(updateSchedules(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || 'Failed to update slot'));
    throw e;
  }
};

export const deleteScheduleSlot = async (token, slotId, dispatch) => {
  try {
    if (!token) throw new Error('Token is missing!');
    if (!slotId) throw new Error('Slot ID is missing!');
    dispatch(setPending(true));

    const response = await axios.delete(`${SCHEDULE_API}/delete/${slotId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(deleteSchedules(slotId));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || 'Failed to delete slot'));
    throw e;
  }
};

// default export for compatibility with existing imports
const ScheduleService = () => ({
  getScheduleByGroupId,
  addSlotByGroup,
  updateScheduleSlot,
  deleteScheduleSlot,
});

export default ScheduleService;
