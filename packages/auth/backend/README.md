# Employee360 Task Manager - Backend

This is the backend API for the Employee360 Task Manager application, which provides authentication, user management, and task management functionality.

## Project Structure

```
backend/
├── config/         # Configuration files (database, etc.)
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── server.js       # Main application entry point
└── package.json    # Dependencies and scripts
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd packages/auth/backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root of the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Server

To start the server in development mode:

```
npm run dev
```

To start the server in production mode:

```
npm start
```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "surname": "User Surname",
    "username": "username",
    "email": "user@example.com",
    "password": "password123",
    "number": "1234567890",
    "birthdate": "1990-01-01",
    "role": "personel"
  }
  ```
- **Success Response**: Status 201, returns user data and token

#### Login User
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "username",
    "password": "password123",
    "role": "personel"
  }
  ```
- **Success Response**: Status 200, returns user data and token

### User Endpoints

#### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Header**: `Authorization: Bearer YOUR_TOKEN`
- **Success Response**: Status 200, returns user profile data

#### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Header**: `Authorization: Bearer YOUR_TOKEN`
- **Request Body** (all fields optional):
  ```json
  {
    "name": "Updated Name",
    "surname": "Updated Surname",
    "email": "updated@example.com",
    "number": "0987654321",
    "password": "newpassword123"
  }
  ```
- **Success Response**: Status 200, returns updated user data

## Error Handling

The API follows a consistent error handling pattern. All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack trace (development only)"
}
```

## Middleware

The application uses several middleware for functionality:

- **Auth Middleware**: Handles authentication and role-based access
- **Error Middleware**: Provides consistent error responses
- **CORS**: Enables cross-origin requests

## Future Enhancements

- Task management functionality
- Email verification
- Password reset
- Administrative features

## License

This project is licensed under the MIT License - see the LICENSE file in the root directory for details.