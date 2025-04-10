import api from '../../api/api';

export const dashboardService = {
  getTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  getTaskStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
};