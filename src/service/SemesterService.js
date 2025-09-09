// src/service/SemesterService.js
import axios from 'axios';
import {
  getSemestersStart,
  getSemestersSuccess,
  getSemestersFailure,
} from '../redux/slice/semesterSlice';
import { REACT_API_URL } from '../api/apiConfig';

const API_SEMESTER = REACT_API_URL + 'class/semester';
export const fetchSemesters = async (token, dispatch) => {
  try {
    if (!token) throw new Error('Missing token or Invalid Token');
    dispatch(getSemestersStart());

    const response = await axios.get(`${API_SEMESTER}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(response);

    const data = response.data;
    dispatch(getSemestersSuccess(data));
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to fetch semesters';
    dispatch(getSemestersFailure(msg));
    throw new Error(msg);
  }
};
