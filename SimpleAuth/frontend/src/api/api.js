import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const register = (user) => axios.post(`${API_URL}/register`, user);
export const login = (user) => axios.post(`${API_URL}/login`, user);
export const updateUser = (id, updatedData) => axios.put(`${API_URL}/${id}`, updatedData);
export const getUser = (id) => axios.get(`${API_URL}/${id}`);
export const getAllPersonnel = () => axios.get(`${API_URL}`);
export const getAllTeams = () => axios.get("http://localhost:5000/api/teams");
export const getAllUsers = () => {
  const token = localStorage.getItem("token"); // veya senin token'ı tuttuğun yer
  return axios.get("http://localhost:5000/api/users/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ Mesaj gönder
export const sendMessage = (messageData) =>
  axios.post("http://localhost:5000/api/messages", messageData);

// ✅ Kullanıcıya gelen ve gönderilen tüm mesajları getir (GÜNCELLENDİ!)
export const getMessagesByUserId = (userId) =>
  axios.get(`http://localhost:5000/api/messages/user/${userId}`);

