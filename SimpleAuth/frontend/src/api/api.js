import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 📌 Add token to every request header
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

// 📌 Redirect to login if token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.data?.message?.includes("jwt expired") || 
      error.response?.data?.message?.includes("invalid") ||
      error.response?.data?.message?.includes("unauthorized")
    ) {
      // Clear invalid credentials
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      
      // Only redirect if not already on login-related pages
      const currentPath = window.location.pathname;
      if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)) {
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

// 🌿 User and authentication endpoints
const API_URL = "/users";

export const register = (user) => api.post(`${API_URL}/register`, user);
export const login = (user) => api.post(`${API_URL}/login`, user);
export const forgotPassword = (email) => api.post(`${API_URL}/forgot-password`, { email });
export const resetPassword = (token, password) => api.post(`${API_URL}/reset-password`, { token, password });
export const updateUser = (id, updatedData) => api.put(`${API_URL}/${id}`, updatedData);
export const getUser = (id) => api.get(`${API_URL}/${id}`);
export const getAllPersonnel = () => api.get(`${API_URL}`);
export const getAllTeams = () => api.get("/teams");
export const getAllUsers = () => api.get("/users/all");
export const getUsersByTeam = (teamId) => api.get(`/users/by-team/${teamId}`);
// ✅ Personel aktif/deaktif durumu değiştirme (yeni ekledik!)
export const toggleUserStatus = (id) => api.patch(`/users/status/${id}`);

// 📩 Message endpoints
export const sendMessage = (messageData) => api.post("/messages", messageData);
export const getMessagesByUserId = (userId) => api.get(`/messages/user/${userId}`);

// 📝 Task endpoints
export const getTasks = () => api.get("/tasks");
export const getTasksByUserId = (userId) => api.get(`/tasks/user/${userId}`);
export const getTasksByTeamId = (teamId) => api.get(`/tasks/team/${teamId}`);
export const createTask = (taskData) => api.post("/tasks", taskData);
export const updateTask = (taskId, taskData) => api.patch(`/tasks/${taskId}`, taskData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

// 🎯 Milestone endpoints
export const getMilestones = () => api.get("/milestones");
export const getMilestonesByUserId = (userId) => api.get(`/milestones/user/${userId}`);
export const getMilestonesByTeamId = (teamId) => api.get(`/milestones/team/${teamId}`);
export const createMilestone = (milestoneData) => api.post("/milestones", milestoneData);
export const assignMilestoneToTeamLeader = (milestoneData) => api.post("/milestones/assign", milestoneData);
export const updateMilestone = (milestoneId, milestoneData) => api.patch(`/milestones/${milestoneId}`, milestoneData);
export const deleteMilestone = (milestoneId) => api.delete(`/milestones/${milestoneId}`);
export const submitMilestone = (milestoneId) => api.patch(`/milestones/${milestoneId}/submit`);
export const verifyMilestone = (milestoneId) => api.patch(`/milestones/${milestoneId}/verify`);
export const rejectMilestone = (milestoneId) => api.patch(`/milestones/${milestoneId}/reject`);

// 📁 File endpoints
export const uploadFile = (formData) => {
  return api.post("/files/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getReceivedFiles = () => api.get("/files/received");
export const getSentFiles = () => api.get("/files/sent");
export const getFileRecipients = () => api.get("/files/recipients");
export const downloadFile = (fileId) => api.get(`/files/download/${fileId}`, { responseType: 'blob' });
export const deleteFile = (fileId) => api.delete(`/files/${fileId}`);

// Helper function to handle API errors in components
export const handleApiError = (error, fallbackMessage = "İşlem sırasında bir hata oluştu") => {
  console.error("API Error:", error);
  
  // Extract error message from response if available
  const errorMessage = 
    error.response?.data?.message || 
    error.message || 
    fallbackMessage;
  
  return errorMessage;
};

export default api;
