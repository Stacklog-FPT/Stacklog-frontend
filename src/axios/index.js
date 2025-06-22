import axios from "axios";

const PORT_BE = "http://localhost:"
const api = axios.create({
  baseURL: `${PORT_BE}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
