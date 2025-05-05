# Employee360 Task Manager

Employee360 Task Manager is a **full-stack task management system** designed for teams to manage tasks, milestones, reports, file sharing, and communication efficiently. It includes role-based access for **personnel**, **team leaders**, and **admins**.

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
cd Employee360_Task_Manager
```

---

### 2️⃣ **Backend Setup**
1. Move into the backend folder:
   ```bash
   cd backend
   ```

2. Install all necessary packages:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Create a `.env` file inside the `backend` folder and add the following:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     FRONTEND_URL=http://localhost:3000
     ```

4. Start the Backend Server:
   ```bash
   node server.js
   ```
   - If everything is correct, the backend should start on `http://localhost:5000`.
   - You should see: `✅ Server 5000 portunda çalışıyor!`

---

### 3️⃣ **Frontend Setup**
1. Move into the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install all necessary packages:
   ```bash
   npm install
   ```

3. Start the Frontend Server:
   ```bash
   npm start
   ```
   - The frontend should now be running on `http://localhost:3000`.
   - Open the URL in your browser and test the app.

---

### 4️⃣ **Run Backend & Frontend Together**
To start both backend and frontend at the same time:
1. Install `concurrently` globally:
   ```bash
   npm install -g concurrently
   ```

2. Modify `frontend/package.json`:
   ```json
   "scripts": {
     "start": "concurrently \"cd ../backend && node server.js\" \"react-scripts start\""
   }
   ```

3. Start the project:
   ```bash
   npm start
   ```

---

## 🚀 Features
### General Features
- **User Management**: Role-based access for personnel, team leaders, and admins.
- **Task Management**: Create, assign, and update tasks.
- **Milestone Management**: Assign, update, and verify project milestones.
- **Reporting**: Generate and manage team reports.
- **File Sharing**: Upload, download, and share files.
- **Messaging**: Communicate between users.
- **Entry Tracking**: Track personnel entry and exit logs.

### Roles & Permissions
- **Personnel**:
  - View assigned tasks.
  - Send messages to team leaders and admins.
  - Receive files.
- **Team Leader**:
  - Assign tasks to team members.
  - Create and submit reports.
  - Send and receive files.
  - Communicate with team members and admins.
- **Admin**:
  - Manage all tasks, milestones, and reports.
  - Assign milestones and verify/reject them.
  - Send, receive, and delete files.
  - Manage user statuses (active/inactive).

---

## 📂 Project Structure

### Backend
- **Models**: Defines the database schema for tasks, milestones, users, and reports.
- **Controllers**: Contains the business logic for handling API requests.
- **Routes**: Defines the API endpoints for tasks, milestones, users, and reports.
- **Utils**: Utility functions like email sending and authentication middleware.

### Frontend
- **Components**: Reusable React components for tasks, milestones, reports, and user management.
- **Pages**: Main pages for admin, team leader, and personnel views.
- **API**: Functions to interact with the backend API.
- **Styles**: CSS files for styling the application.

---

## 📊 API Endpoints

### User Management
- **POST** `/api/users/login`: Login a user.
- **GET** `/api/users`: Get all users (admin only).
- **PUT** `/api/users/:id`: Update user details.

### Task Management
- **GET** `/api/tasks`: Get all tasks (role-based filtering).
- **POST** `/api/tasks`: Create a new task (team leader only).
- **PUT** `/api/tasks/:id/status`: Update task status.

### Milestone Management
- **GET** `/api/milestones`: Get all milestones (admin only).
- **POST** `/api/milestones`: Create a new milestone (admin only).
- **PUT** `/api/milestones/:id/status`: Update milestone status.

### Reporting
- **GET** `/api/reports`: Get all reports (admin only).
- **POST** `/api/reports`: Create a new report (team leader only).
- **PUT** `/api/reports/:id/submit`: Submit a report for review.

---

## 🛠️ Technologies Used
- **Frontend**: React.js, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS, Bootstrap
- **Email Notifications**: Nodemailer

--
