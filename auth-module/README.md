# Auth Module - Employee360

The authentication module for the Employee360 Task Manager system. This module handles user authentication, registration, and basic user profile management.

## Structure

```
auth-module/
├── backend/          # Authentication API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # User model
│   │   ├── routes/       # API routes
│   │   ├── services/     # Authentication logic
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Express application
│   │   └── server.js     # Server entry point
│   ├── .env              # Environment variables
│   └── package.json      # Dependencies
└── frontend/         # Authentication UI components
```

## Features

- User registration with validation
- User login with JWT authentication
- Role-based access control (admin/employee)
- Password hashing with bcrypt
- Token-based authentication
- User profile management

## API Endpoints

### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user

### Protected Routes
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Admin Routes
- `GET /api/auth/users` - Get all users (admin only)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)

### Installation

1. Navigate to the backend directory:
   ```
   cd auth-module/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/auth_module
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage as a Dependency

To use this module in other parts of the Employee360 system:

```javascript
const { auth } = require('@employee360/auth-module-backend');

// Use as middleware
app.use('/protected-route', auth(), (req, res) => {
  // Access authenticated user via req.user
  res.json({ user: req.user });
});

// Use with role-based access
app.use('/admin-only', auth('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```