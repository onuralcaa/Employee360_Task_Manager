# Employee360 Task Manager 👥

A comprehensive employee management and task tracking system with authentication and role-based permissions.

## 🌟 System Architecture

Employee360 uses a modular architecture to promote reusability, maintainability, and separation of concerns:

```
employee360/
├── auth-module/          # Authentication and user management
│   ├── backend/          # Authentication API
│   └── frontend/         # Authentication UI components
├── employee-core/        # Employee management 
│   ├── backend/          # Employee profiles and departments API
│   └── frontend/         # Employee management UI
├── task-module/          # Task and project management
│   ├── backend/          # Tasks and projects API
│   └── frontend/         # Task management UI
└── shared/               # Shared utilities and components
```

### Module Responsibilities

#### Auth Module
- User authentication (login/register)
- JWT token management
- User roles and permissions
- Basic user profiles

#### Employee Core
- Extended employee profiles
- Department management
- Employee skills and certifications
- Performance reviews

#### Task Module
- Task creation and assignment
- Project management
- Task statuses and priorities
- Comments and attachments

## 🌟 Features

- **Authentication**: Secure user login and registration
- **Role-Based Access**: 
  - 👔 Admins can manage everything
  - 👤 Employees can view their tasks and update their profiles
- **Employee Management**: Complete employee information and department organization
- **Task Management**: Assign, track, and complete tasks
- **Project Management**: Group tasks into projects with team members
- **Theme Options**: Light and dark modes

## 🛠️ Technologies

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## 📋 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/employee360.git
   ```

2. Set up environment variables:
   - Create `.env` files in each module's backend directory
   - See the `.env.example` files for required variables

3. Install dependencies and start services:

   ```
   # Auth module setup
   cd auth-module/backend
   npm install
   npm run dev
   
   # In a new terminal
   cd employee-core/backend
   npm install
   npm run dev
   
   # In a new terminal
   cd task-module/backend
   npm install
   npm run dev
   
   # Frontend setup (when available)
   cd frontend
   npm install
   npm run dev
   ```

## 🔄 API Endpoints

### Auth Module API (Port 5000)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Employee Core API (Port 5001)
- `GET /api/employees` - Get all employees (admin only)
- `GET /api/employees/:userId` - Get employee profile
- `PUT /api/employees/:userId` - Update employee profile
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (admin only)

### Task Module API (Port 5002)
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create a new task (admin only)
- `PUT /api/tasks/:id` - Update task status
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (admin only)

## 🤝 Want to Help?

Feel free to:
- Report any bugs you find
- Suggest new features
- Help improve the code

Just create an issue or submit a pull request!

## 📝 License

This project is under the MIT License - see the LICENSE file for details.

---
Made with ❤️ by [Your Name]
Star ⭐ this repo if you found it helpful!


