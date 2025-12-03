import axios from 'axios';
import { REACT_API_URL } from '../api/apiConfig';

const api = axios.create({
  // Leave baseURL empty so callers can include either the dev-relative
  // `REACT_API_URL` (which is `/api/` in dev) or the absolute production URL.
  // This avoids doubling `/api` when code already prepends `REACT_API_URL`.
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

export default api;
