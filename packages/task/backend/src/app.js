const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('@employee360/auth-module-backend');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'packages/task',
    timestamp: new Date().toISOString()
  });
});

// Protected routes - require authentication
app.use('/api/tasks', auth(), require('./routes/taskRoutes'));
app.use('/api/projects', auth(), require('./routes/projectRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;