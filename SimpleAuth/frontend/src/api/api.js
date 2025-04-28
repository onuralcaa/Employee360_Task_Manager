import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 📌 Token'ı her istek öncesinde güncel şekilde header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📌 Token süresi dolmuşsa logout yap ve giriş ekranına yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message?.includes("jwt expired")) {
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

// 🌿 Aşağıdaki exportlar aynı kalıyor
const API_URL = "/users";

export const register = (user) => api.post(`${API_URL}/register`, user);
export const login = (user) => api.post(`${API_URL}/login`, user);
export const updateUser = (id, updatedData) => api.put(`${API_URL}/${id}`, updatedData);
export const getUser = (id) => api.get(`${API_URL}/${id}`);
export const getAllPersonnel = () => api.get(`${API_URL}`);
export const getAllTeams = () => api.get("/teams");
export const getAllUsers = () => api.get("/users/all");

export const sendMessage = (messageData) => api.post("/messages", messageData);
export const getMessagesByUserId = (userId) => api.get(`/messages/user/${userId}`);

export default api;
