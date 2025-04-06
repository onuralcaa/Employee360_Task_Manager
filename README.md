# Employee360 Task Manager 👥

A simple web application I created to help businesses manage their employees and projects. Think of it as a digital HR assistant! 

## 🌟 What Can It Do?

- **Login & Register**: Employees and admins can create accounts and log in securely
- **Different User Roles**: 
  - 👔 Admins can manage everything
  - 👤 Employees can view their tasks and update their profiles
- **Theme Options**: Switch between light and dark modes for comfortable viewing
- **User Profiles**: Keep track of employee information
- **Coming Soon**: 
  - 📝 Task management
  - 🎯 Project tracking

## 🚀 Getting Started

### What You Need First
- Node.js installed on your computer ([Download here](https://nodejs.org/))
- MongoDB database (I'm using MongoDB Atlas - it's free!)
- Basic knowledge of command line/terminal

### Setup Steps

1. Clone this project to your computer:
```bash
git clone https://github.com/yourusername/Employee360_Task_Manager.git
cd Employee360_Task_Manager
```

2. Install everything you need (do this once):
```bash
npm run install:all
```

3. Create two files for your settings:

In `SimpleAuth/backend/.env`:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=make_up_a_secret_key
```

In `SimpleAuth/frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api/users
```

4. Start the app:
```bash
npm start
```

The website will open at `http://localhost:3000` 🎉

## 🛠️ What's Inside

- **Frontend**: Made with React (the stuff you see on screen)
- **Backend**: Node.js + Express (handles all the behind-the-scenes work)
- **Database**: MongoDB (where all the data is stored)

## 🎨 Screenshots

[Coming Soon!]

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


