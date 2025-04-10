// Initialize script for Employee360 Task Manager
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '🚀 Employee360 Görev Yöneticisi Başlatılıyor...');

// Function to create .env file if it doesn't exist
function createEnvFile() {
  const backendEnvPath = path.join(__dirname, 'packages', 'auth', 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'packages', 'auth', 'frontend', '.env');
  
  if (!fs.existsSync(backendEnvPath)) {
    console.log('\x1b[33m%s\x1b[0m', '📝 Backend .env dosyası oluşturuluyor...');
    const backendEnvContent = 
`NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee360
JWT_SECRET=employee360secretkey`;
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('\x1b[32m%s\x1b[0m', '✅ Backend .env dosyası oluşturuldu!');
  }
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('\x1b[33m%s\x1b[0m', '📝 Frontend .env dosyası oluşturuluyor...');
    const frontendEnvContent = 'VITE_API_URL=http://localhost:5000/api/users';
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('\x1b[32m%s\x1b[0m', '✅ Frontend .env dosyası oluşturuldu!');
  }
}

// Install all dependencies
function installDependencies() {
  console.log('\x1b[33m%s\x1b[0m', '📦 Tüm bağımlılıklar yükleniyor...');
  try {
    execSync('npm run install:all', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', '✅ Tüm bağımlılıklar başarıyla yüklendi!');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Bağımlılık yükleme hatası:', error.message, '\nHata İzleme:', error.stack);
    process.exit(1);
  }
}

// Main initialization function
async function init() {
  createEnvFile();
  
  rl.question('\x1b[36m Şimdi tüm bağımlılıkları yüklemek ister misiniz? (e/h) \x1b[0m', (answer) => {
    if (answer.toLowerCase() === 'e') {
      installDependencies();
    }
    
    console.log('\x1b[36m%s\x1b[0m', '\n🎉 Başlatma tamamlandı!');
    console.log('\x1b[36m%s\x1b[0m', '📋 Uygulamayı başlatmak için şu komutu çalıştırın: npm start');
    console.log('\x1b[36m%s\x1b[0m', '👉 Uygulamaya şu adresten erişin: http://localhost:3000\n');
    
    rl.close();
  });
}

// Run initialization
init();