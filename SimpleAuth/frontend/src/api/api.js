import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const register = (user) => axios.post(`${API_URL}/register`, user);
export const login = (user) => axios.post(`${API_URL}/login`, user);
export const updateUser = (id, updatedData) => axios.put(`${API_URL}/${id}`, updatedData);
export const getUser = (id) => axios.get(`${API_URL}/${id}`);
export const getAllPersonnel = () => axios.get(`${API_URL}`);
