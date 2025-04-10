# Employee Core Module - Employee360

The employee management core module for the Employee360 Task Manager system. This module handles employee profiles, departments, and employee-related functionalities.

## Structure

```
packages/employee/
├── backend/           # Employee management API
│   ├── src/
│   │   ├── models/       # Employee and Department models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── app.js        # Express application
│   │   └── server.js     # Server entry point
│   ├── .env              # Environment variables
│   └── package.json      # Dependencies
└── frontend/          # Employee management UI components
```

## Features

- Comprehensive employee profiles
- Department management
- Employee skills tracking
- Certification management
- Performance review system
- Role-based access control

## API Endpoints

### Employee Routes
- `GET /api/employees` - Get all employees (admin only)
- `GET /api/employees/:userId` - Get employee profile
- `POST /api/employees` - Create employee profile (admin only)
- `PUT /api/employees/:userId` - Update employee profile
- `POST /api/employees/:userId/skills` - Add skill to employee profile
- `POST /api/employees/:userId/certifications` - Add certification to employee profile
- `POST /api/employees/:userId/reviews` - Add performance review (admin only)

### Department Routes
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Auth Module running

### Installation

1. Navigate to the backend directory:
   ```
   cd packages/employee/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/employee360
   AUTH_MODULE_URL=http://localhost:5000/api/auth
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage as a Dependency

To use this module in other parts of the Employee360 system:

```javascript
const employeeService = require('@employee360/employee-core-backend/src/services/employeeService');

// Example: Get employee profiles
const profiles = await employeeService.getEmployeeProfiles();

// Example: Add skill to employee
const updatedProfile = await employeeService.addSkill(userId, 'JavaScript');
```