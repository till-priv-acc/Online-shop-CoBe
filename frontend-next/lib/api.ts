import axios from "axios";

export const api = axios.create({
  baseURL: "/api",   // Proxy von Next.js
  withCredentials: true, // falls Cookies/Session in Nest bleiben
});