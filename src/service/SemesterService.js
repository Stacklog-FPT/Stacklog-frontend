// src/service/SemesterService.js
import axios from 'axios';
import {
  getSemestersStart,
  getSemestersSuccess,
  getSemestersFailure,
} from '../redux/slice/semesterSlice';

export const fetchSemesters = async (token, dispatch) => {
  try {
    dispatch(getSemestersStart());
    if (!token) throw new Error('Missing token or Invalid Token');

    const response = await axios.get('http://localhost:3001/semesters', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data;
    dispatch(getSemestersSuccess(data));
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to fetch semesters';
    dispatch(getSemestersFailure(msg));
    throw new Error(msg);
  }
};
