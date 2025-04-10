# Employee360 Task Manager - Frontend

This is the frontend application for Employee360 Task Manager, a web application for employee task management with authentication and role-based permissions.

## Project Structure

```
frontend/
├── public/         # Static files
├── src/            # Source code
│   ├── api/        # API service layer
│   ├── components/ # React components
│   │   ├── auth/   # Authentication components
│   │   ├── common/ # Shared/reusable components
│   │   └── layout/ # Layout components
│   ├── contexts/   # React context providers
│   ├── hooks/      # Custom React hooks
│   ├── pages/      # Page components
│   ├── utils/      # Utility functions
│   ├── App.jsx     # Main application component
│   └── main.jsx    # Application entry point
├── .env            # Environment variables
├── index.html      # HTML template
├── package.json    # Dependencies and scripts
└── vite.config.js  # Vite configuration
```

## Technologies Used

- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React-Toastify** - Notifications
- **Vite** - Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd packages/auth/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```
4. Create a `.env` file in the root of the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api/users
   ```

### Running the Application

To start the development server:

```
npm run dev
```
or
```
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```
npm run build
```
or
```
yarn build
```

## Key Features

### Authentication

- User registration
- User login with role selection (Personnel/Admin)
- Protected routes
- Authentication persistence using local storage

### User Management

- Profile viewing
- Profile editing

### Role-Based Access

- Different views and permissions for Personnel and Admin roles
- Route protection based on user role

## Component Architecture

### Contexts

- **AuthContext**: Manages authentication state across the application

### Common Components

- **LoadingSpinner**: Reusable loading indicator
- **ProtectedRoute**: Route wrapper for authentication
- **UIButton**: Customizable button component

### Utility Functions

- **validation.js**: Form validation utilities
- **errorHandling.js**: Centralized error handling

## Development Guidelines

### Adding New Features

1. Create components in the appropriate directory
2. Use the existing context or create a new one if needed
3. Add validation using the validation utilities
4. Handle errors using the error handling utilities
5. Update tests if applicable

### Styling

- Component-specific CSS files are co-located with components
- Common styles are in `src/index.css`

## Future Enhancements

- Task management functionality
- Dashboard with statistics
- Admin panel for user management
- Theme customization
- Multi-language support

## License

This project is licensed under the MIT License - see the LICENSE file in the root directory for details.
