# Task Module - Employee360

The task management module for the Employee360 Task Manager system. This module handles tasks, projects, and all task-related functionalities.

## Structure

```
task-module/
├── backend/           # Task management API
│   ├── src/
│   │   ├── models/       # Task and Project models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── app.js        # Express application
│   │   └── server.js     # Server entry point
│   ├── .env              # Environment variables
│   └── package.json      # Dependencies
└── frontend/          # Task management UI components
```

## Features

- Task creation and assignment
- Project management and team collaboration
- Task status tracking
- Task comments and discussions
- Task priority management
- Project statistics and reporting
- Due date tracking

## API Endpoints

### Task Routes
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Archive task (admin only)
- `POST /api/tasks/:id/comments` - Add comment to task
- `GET /api/tasks/stats/summary` - Get task statistics (admin only)

### Project Routes
- `GET /api/projects` - Get projects (filtered by user role)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Archive project (admin only)
- `POST /api/projects/:id/team` - Add team member to project
- `DELETE /api/projects/:id/team/:userId` - Remove team member from project
- `GET /api/projects/stats/summary` - Get project statistics (admin only)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Auth Module running
- Employee Core Module running

### Installation

1. Navigate to the backend directory:
   ```
   cd task-module/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5002
   MONGO_URI=mongodb://localhost:27017/employee360
   AUTH_MODULE_URL=http://localhost:5000/api/auth
   EMPLOYEE_CORE_URL=http://localhost:5001/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage as a Dependency

To use this module in other parts of the Employee360 system:

```javascript
const taskService = require('@employee360/task-module-backend/src/services/taskService');

// Example: Get tasks for a specific user
const userTasks = await taskService.getTasksByAssignee(userId);

// Example: Get task stats
const taskStats = await taskService.getTaskStats();
```