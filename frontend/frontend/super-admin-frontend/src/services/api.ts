
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,

  // Supports HttpOnly cookie authentication if your
  // backend uses cookies for its JWT session.
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
