import { dashboardService } from './dashboardService';
import api from '../../api/api';

// Mock the api module
jest.mock('../../api/api');

describe('dashboardService', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Task description',
    status: 'pending'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('fetches tasks successfully', async () => {
      const mockResponse = { data: [mockTask] };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.getTasks();
      expect(api.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error when fetching tasks fails', async () => {
      const error = new Error('Failed to fetch tasks');
      api.get.mockRejectedValueOnce(error);

      await expect(dashboardService.getTasks()).rejects.toThrow(error);
    });
  });

  describe('createTask', () => {
    const newTask = {
      title: 'New Task',
      description: 'New task description'
    };

    it('creates task successfully', async () => {
      const mockResponse = { data: { ...newTask, id: 1 } };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.createTask(newTask);
      expect(api.post).toHaveBeenCalledWith('/tasks', newTask);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error when creating task fails', async () => {
      const error = new Error('Failed to create task');
      api.post.mockRejectedValueOnce(error);

      await expect(dashboardService.createTask(newTask)).rejects.toThrow(error);
    });
  });

  describe('updateTask', () => {
    const taskId = 1;
    const updateData = {
      status: 'completed'
    };

    it('updates task successfully', async () => {
      const mockResponse = { data: { ...mockTask, ...updateData } };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.updateTask(taskId, updateData);
      expect(api.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error when updating task fails', async () => {
      const error = new Error('Failed to update task');
      api.put.mockRejectedValueOnce(error);

      await expect(dashboardService.updateTask(taskId, updateData)).rejects.toThrow(error);
    });
  });

  describe('deleteTask', () => {
    const taskId = 1;

    it('deletes task successfully', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.deleteTask(taskId);
      expect(api.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error when deleting task fails', async () => {
      const error = new Error('Failed to delete task');
      api.delete.mockRejectedValueOnce(error);

      await expect(dashboardService.deleteTask(taskId)).rejects.toThrow(error);
    });
  });

  describe('getTaskStats', () => {
    it('fetches task statistics successfully', async () => {
      const mockStats = {
        total: 10,
        completed: 5,
        pending: 5
      };
      const mockResponse = { data: mockStats };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.getTaskStats();
      expect(api.get).toHaveBeenCalledWith('/tasks/stats');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error when fetching task stats fails', async () => {
      const error = new Error('Failed to fetch task statistics');
      api.get.mockRejectedValueOnce(error);

      await expect(dashboardService.getTaskStats()).rejects.toThrow(error);
    });
  });
});