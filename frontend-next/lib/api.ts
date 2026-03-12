import axios from "axios";

export const api = axios.create({
  baseURL: "/api",          // Next.js Proxy zum Nest Backend
  withCredentials: true,    // falls Sessions/Cookies gebraucht werden
});