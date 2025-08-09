import axios from "axios";

const PORT_BE = "https://stacklog.id.vn/api";
const api = axios.create({
  baseURL: `${PORT_BE}`,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

export default api;
