# Employee360_Task_Manager

# SimpleAuth - Full-Stack Authentication System

SimpleAuth is a **full-stack authentication system** built with **React (Frontend)** and **Node.js/Express + MongoDB (Backend)**.  
It allows users to **register, login, and access a protected dashboard**.

This guide will help you **install, configure, and run** the project from scratch.

---

## 📌 Prerequisites (Requirements)
Before installing, make sure you have:

- [Node.js (v14 or higher)](https://nodejs.org/)
- [MongoDB (local or MongoDB Atlas)](https://www.mongodb.com/)
- [Git](https://git-scm.com/) (to clone the repository)

---

## 📥 Installation & Setup

### 1️⃣ **Clone the Repository**
First, download the project files from GitHub:
```bash
git clone https://github.com/onuralcaa/Employee360_Task_Manager
cd SimpleAuth

******************************************************************************************************
 Backend Setup:
 Move into the backend folder:
 --------------------------------------
 cd backend

 Run the following command to install all necessary packages:
 (This installs all required dependencies: Express (server), Mongoose (MongoDB), CORS, JWT, bcrypt, etc.)
 --------------------------------------
 npm install express mongoose dotenv cors body-parser bcrypt jsonwebtoken


Configure Environment Variables:
Create a .env file inside the backend folder and add the following:
Replace your_mongodb_connection_string with your MongoDB connection URI.
Replace your_secret_key with a secret key for JSON Web Tokens.
--------------------------------------
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Start the Backend Server:
---------------------------------------
node server.js

->If everything is correct, the backend should start on http://localhost:5000.
->You should see: ✅ "Server 5000 portunda çalışıyor!"

******************************************************************************************************
Frontend Setup
Move into the frontend folder:
---------------------------------------
cd ../frontend

 Install Frontend Dependencies:
 Run the following command:
 (This installs axios for API requests and react-router-dom for navigation.)
 -------------------------------------
 npm install axios react-router-dom

  Start the Frontend Server:
  ------------------------------------
  npm start

->The frontend should now be running on http://localhost:3000.
->Open the URL in your browser and test the app.

*****************************************************************************************************

Run Backend & Frontend Together:
To start both backend and frontend at the same time, use:
1-Install concurrently:
--------------------------------------
npm install -g concurrently

2-Modify frontend/package.json:
--------------------------------------
"scripts": {
  "start": "concurrently \"cd ../backend && node server.js\" \"react-scripts start\""
}

3-Start the project:
---------------------------------------
npm start
```

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or the connection string in the `.env` file is correct.
   - Check if the `MONGO_URI` environment variable is properly set.

2. **Frontend Not Loading**
   - Verify that the backend server is running on the correct port.
   - Check the `REACT_APP_API_URL` environment variable in the frontend `.env` file.

3. **JWT Token Issues**
   - Ensure the `JWT_SECRET` environment variable is set in the backend `.env` file.
   - Clear cookies if authentication issues persist.

4. **CORS Errors**
   - Update the CORS configuration in the backend to allow requests from the frontend's domain.

5. **Dependencies Not Found**
   - Run `npm install` in both the `frontend` and `backend` directories to install missing dependencies.

6. **Build Errors**
   - Ensure you are using the correct Node.js version as specified in the `engines` field of `package.json` (if present).

### Contact
For further assistance, please contact the project maintainer or open an issue on GitHub.


