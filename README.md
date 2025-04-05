# Employee360 Task Manager

Employee360 Task Manager is a full-stack web application for employee task management with authentication and role-based access control. The application allows employees to manage tasks while administrators can oversee employee activities.

![Employee360 Task Manager](https://via.placeholder.com/800x400?text=Employee360+Task+Manager)

## Project Structure

The project is organized as a monorepo with separate frontend and backend components:

```
Employee360_Task_Manager/
├── LICENSE
├── package.json        # Root package.json with consolidated scripts
├── init.js             # Project initialization script
├── README.md
├── SimpleAuth/
│   ├── backend/
│   │   ├── config/
│   │   │   └── db.js                  # Database connection setup
│   │   ├── controllers/
│   │   │   └── userController.js      # User-related request handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # Authentication middleware
│   │   │   └── errorMiddleware.js     # Centralized error handling
│   │   ├── models/
│   │   │   └── userModel.js           # User data model
│   │   ├── routes/
│   │   │   └── userRoutes.js          # API endpoint definitions
│   │   ├── services/
│   │   │   └── userService.js         # Business logic layer
│   │   ├── utils/                     # Utility functions
│   │   ├── package.json               # Backend dependencies
│   │   ├── README.md                  # Backend documentation
│   │   └── server.js                  # Express server entry point
│   │
│   └── frontend/
│       ├── public/                    # Static assets
│       │   ├── favicon.ico
│       │   ├── index.html
│       │   ├── logo192.png
│       │   ├── logo512.png
│       │   ├── manifest.json
│       │   └── robots.txt
│       ├── src/
│       │   ├── api/
│       │   │   └── api.js             # API communication layer
│       │   ├── components/
│       │   │   ├── common/
│       │   │   │   ├── LoadingSpinner.jsx   # Loading indicator
│       │   │   │   ├── LoadingSpinner.css
│       │   │   │   ├── ProtectedRoute.jsx   # Route protection
│       │   │   │   ├── ThemeToggle.jsx      # Theme switching button
│       │   │   │   ├── ThemeToggle.css
│       │   │   │   ├── UIButton.jsx         # Reusable button
│       │   │   │   └── UIButton.css
│       │   │   ├── Dashboard.jsx      # Main dashboard
│       │   │   ├── Dashboard.css
│       │   │   ├── Login.jsx          # Login page
│       │   │   ├── Login.css
│       │   │   ├── PasswordToggle.jsx # Password visibility toggle
│       │   │   ├── PersonelPage.jsx   # Personnel specific page
│       │   │   ├── PersonelPage.css
│       │   │   ├── Register.jsx       # Registration page
│       │   │   └── Register.css
│       │   ├── contexts/
│       │   │   ├── AuthContext.jsx    # Authentication state management
│       │   │   └── ThemeContext.jsx   # Theme state management
│       │   ├── utils/
│       │   │   ├── errorHandling.js   # Error handling utilities
│       │   │   └── validation.js      # Form validation utilities
│       │   ├── App.css
│       │   ├── App.jsx                # Main application component
│       │   ├── index.css              # Global styles with theme variables
│       │   ├── logo.svg
│       │   ├── main.jsx               # Application entry point
│       │   └── setupTests.js          # Test configuration
│       ├── index.html                 # HTML template
│       ├── package.json               # Frontend dependencies
│       ├── README.md                  # Frontend documentation
│       └── vite.config.js             # Vite configuration
```

## Features

- **Authentication System**: Secure login and registration with JWT
- **Role-Based Access Control**: Different permissions for personnel and administrators
- **User Management**: Create and manage user profiles
- **Protected Routes**: Secure access to authorized pages based on user roles
- **Responsive UI**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling across the application
- **Form Validation**: Client-side validation for all user inputs
- **Task Management**: (Coming soon) Create, update, assign and complete tasks
- **Theme System**: Toggle between light, dark, and system default themes
- **Simplified Setup**: One-command initialization and application startup

## Technologies Used

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API architecture
- Middleware for auth protection and error handling

### Frontend
- React 18+
- Vite for build optimization
- React Router v6
- Axios for API calls
- React Context API for state management
- React-Toastify for notifications
- CSS with component-scoped styling
- React Icons for UI elements

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/Employee360_Task_Manager.git
cd Employee360_Task_Manager
```

2. Initialize the project (creates environment files and installs dependencies):
```
npm run init
```

Or install everything manually:

```
npm run install:all
```

3. Create environment files if not using the init script:

Backend `.env` file (in SimpleAuth/backend/):
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Frontend `.env` file (in SimpleAuth/frontend/):
```
VITE_API_URL=http://localhost:5000/api/users
```

### Running the Application

Start both frontend and backend with a single command from the project root:
```
npm start
```

Or run them separately:

1. Start the backend server:
```
cd SimpleAuth/backend
npm start
```

2. In a new terminal, start the frontend development server:
```
cd SimpleAuth/frontend
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Application Architecture

### Backend Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic separate from controllers
- **Models**: Define data structure with Mongoose schemas
- **Middleware**: Handle authentication, error processing, and request validation
- **Routes**: Define API endpoints and connect them to controllers
- **Config**: Application configuration including database connection

### Frontend Architecture
- **Components**: Reusable UI components like buttons, forms, and page layouts
- **Contexts**: Global state management with React Context API
- **API**: Centralized API communication layer
- **Utils**: Helper functions for validation, error handling, etc.

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Protected API endpoints
- Role-based access control
- Secure HTTP-only cookies (in production)
- Input validation and sanitization

## Project Improvements (as of April 2025)

1. **Enhanced Authentication Flow**:
   - Improved token handling and validation
   - Better error messages for authentication failures
   - Persistent login across browser sessions

2. **Optimized Frontend Performance**:
   - Vite-based build system for faster development
   - Code splitting for improved load times
   - Optimized component rendering

3. **UI/UX Improvements**:
   - Theme toggle (light, dark, system default)
   - More intuitive navigation
   - Consistent styling across components
   - Responsive design for all screen sizes
   - Loading states for asynchronous operations

4. **Developer Experience**:
   - Simplified project setup with initialization script
   - Consolidated npm commands in root package.json
   - Better separation of concerns
   - Improved documentation and comments

## Future Development Plans

- Task management system with assignment capabilities
- Notifications system for task updates
- Dashboard with analytics and reporting
- Team management features
- Calendar integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## Acknowledgments

- All contributors who have helped improve this project
- The open source community for the amazing tools and libraries


