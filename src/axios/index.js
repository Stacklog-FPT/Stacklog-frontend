import axios from "axios";

const PORT_BE = "http://103.166.183.142:8080/api";
const api = axios.create({
  baseURL: `${PORT_BE}`,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

export default api;
