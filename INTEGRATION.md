# Employee360 Task Manager - Module Integration Guide

This guide explains how to integrate the various modules in the Employee360 Task Manager system after the restructuring.

## Module Dependencies

The system uses the following module dependency structure:

```
@employee360/shared
  └─── @employee360/auth-module-backend
        └─── @employee360/employee-core-backend
              └─── @employee360/task-module-backend
```

## Local Development Setup

For local development, you'll need to use npm workspace or link the modules locally.

### Option 1: Using npm link

1. Link the shared module:
   ```bash
   cd shared
   npm link
   cd ../auth-module/backend
   npm link @employee360/shared
   cd ../../employee-core/backend
   npm link @employee360/shared
   cd ../../task-module/backend
   npm link @employee360/shared
   ```

2. Link the auth-module:
   ```bash
   cd auth-module/backend
   npm link
   cd ../../employee-core/backend
   npm link @employee360/auth-module-backend
   cd ../../task-module/backend
   npm link @employee360/auth-module-backend
   ```

3. Link the employee-core module:
   ```bash
   cd employee-core/backend
   npm link
   cd ../../task-module/backend
   npm link @employee360/employee-core-backend
   ```

### Option 2: Using a Monorepo Tool

Consider setting up a monorepo using one of these tools:
- Lerna
- npm workspaces
- Turborepo
- Nx

## Running the Application

Start the services in this order:

1. Auth Module: `cd auth-module/backend && npm run dev`
2. Employee Core: `cd employee-core/backend && npm run dev`
3. Task Module: `cd task-module/backend && npm run dev`

## Module Communication

### Authentication & Authorization

The auth module provides authentication middleware that can be used by other modules:

```javascript
const { auth } = require('@employee360/auth-module-backend');

// Use as middleware to protect routes
router.get('/protected-route', auth(), (req, res) => {
  // Access authenticated user via req.user
  res.json({ message: `Hello ${req.user.name}!` });
});

// Use with role-based access
router.get('/admin-only', auth('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

### Using Shared Utilities

All modules can use the shared utilities:

```javascript
// Import logger
const { logger } = require('@employee360/shared').logger;
logger.info('This is an info message');

// Import validation utilities
const { validateEmail } = require('@employee360/shared').validation;
const isValid = validateEmail('user@example.com');

// Import error utilities
const { ApiError, ErrorCodes } = require('@employee360/shared').errors;
throw new ApiError(ErrorCodes.NOT_FOUND, 'User not found');
```

## Environment Variables

Each module needs its own `.env` file with configuration:

### Auth Module (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth_module
JWT_SECRET=your_jwt_secret
```

### Employee Core (.env)
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/employee360
AUTH_MODULE_URL=http://localhost:5000/api/auth
```

### Task Module (.env)
```
NODE_ENV=development
PORT=5002
MONGO_URI=mongodb://localhost:27017/employee360
AUTH_MODULE_URL=http://localhost:5000/api/auth
EMPLOYEE_CORE_URL=http://localhost:5001/api
```

## Database Considerations

- The auth-module uses its own database collection
- The employee-core and task-module can share a database but use different collections
- Ensure MongoDB is installed and running before starting the services