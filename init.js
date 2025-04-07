// Initialize script for Employee360 Task Manager
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '🚀 Initializing Employee360 Task Manager...');

// Function to create .env file if it doesn't exist
function createEnvFile() {
  const backendEnvPath = path.join(__dirname, 'SimpleAuth', 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'SimpleAuth', 'frontend', '.env');
  
  if (!fs.existsSync(backendEnvPath)) {
    console.log('\x1b[33m%s\x1b[0m', '📝 Creating backend .env file...');
    const backendEnvContent = 
`NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee360
JWT_SECRET=employee360secretkey`;
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('\x1b[32m%s\x1b[0m', '✅ Backend .env file created!');
  }
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('\x1b[33m%s\x1b[0m', '📝 Creating frontend .env file...');
    const frontendEnvContent = 'VITE_API_URL=http://localhost:5000/api/users';
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('\x1b[32m%s\x1b[0m', '✅ Frontend .env file created!');
  }
}

// Install all dependencies
function installDependencies() {
  console.log('\x1b[33m%s\x1b[0m', '📦 Installing all dependencies...');
  try {
    execSync('npm run install:all', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', '✅ All dependencies installed successfully!');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Main initialization function
async function init() {
  createEnvFile();
  
  rl.question('\x1b[36m Would you like to install all dependencies now? (y/n) \x1b[0m', (answer) => {
    if (answer.toLowerCase() === 'y') {
      installDependencies();
    }
    
    console.log('\x1b[36m%s\x1b[0m', '\n🎉 Initialization complete!');
    console.log('\x1b[36m%s\x1b[0m', '📋 To start the application, run: npm start');
    console.log('\x1b[36m%s\x1b[0m', '👉 Access the application at: http://localhost:3000\n');
    
    rl.close();
  });
}

// Run initialization
init();