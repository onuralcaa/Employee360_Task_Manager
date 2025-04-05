import axios from "axios";

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/users";

export const register = (user) => axios.post(`${API_URL}/register`, user);
export const login = (user) => axios.post(`${API_URL}/login`, user);
