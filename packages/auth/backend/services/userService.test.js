const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { registerUser, loginUser, updateUser, getUsers, changePassword } = require('./userService');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

describe('User Service', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      const result = await registerUser(userData);
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('_id');
      expect(result.user.username).toBe(userData.username);
      expect(result.user.email).toBe(userData.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      await registerUser(userData);
      
      const duplicateUser = {
        ...userData,
        email: 'different@example.com'
      };

      await expect(registerUser(duplicateUser)).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    let testUser;

    beforeEach(async () => {
      testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };
      await registerUser(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const result = await loginUser(testUser.username, testUser.password);

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('_id');
      expect(result.user.username).toBe(testUser.username);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for incorrect password', async () => {
      await expect(loginUser(testUser.username, 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for non-existent user', async () => {
      await expect(loginUser('nonexistent', testUser.password))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('updateUser', () => {
    let testUser;
    let userId;

    beforeEach(async () => {
      testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };
      const result = await registerUser(testUser);
      userId = result.user._id;
    });

    it('should update user details successfully', async () => {
      const updateData = {
        name: 'Updated',
        surname: 'User',
        email: 'updated@example.com'
      };

      const updatedUser = await updateUser(userId, updateData);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.surname).toBe(updateData.surname);
      expect(updatedUser.email).toBe(updateData.email);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(updateUser(fakeId, { name: 'Test' }))
        .rejects.toThrow('User not found');
    });
  });

  describe('getUsers', () => {
    beforeEach(async () => {
      const users = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'Password123',
          name: 'User',
          surname: 'One'
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'Password123',
          name: 'User',
          surname: 'Two'
        }
      ];

      await Promise.all(users.map(user => registerUser(user)));
    });

    it('should return list of users', async () => {
      const result = await getUsers();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      result.forEach(user => {
        expect(user).toHaveProperty('username');
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('changePassword', () => {
    let testUser;
    let userId;

    beforeEach(async () => {
      testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };
      const result = await registerUser(testUser);
      userId = result.user._id;
    });

    it('should change the password successfully', async () => {
      await changePassword(userId, 'Password123', 'NewPassword123');
      const user = await User.findById(userId).select('+password');
      const isMatch = await bcrypt.compare('NewPassword123', user.password);
      expect(isMatch).toBe(true);
    });

    it('should throw an error for incorrect current password', async () => {
      await expect(changePassword(userId, 'WrongPassword', 'NewPassword123'))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw an error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(changePassword(fakeId, 'Password123', 'NewPassword123'))
        .rejects.toThrow('User not found');
    });
  });
});