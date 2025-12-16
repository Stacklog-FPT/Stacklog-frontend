import axios from "axios";
import { REACT_API_URL } from "../api/apiConfig";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

export default api;
