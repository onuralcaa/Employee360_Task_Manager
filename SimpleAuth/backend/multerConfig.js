// fileController.js
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Make sure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Depolama ve dosya ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // uploads klasörüne kaydedecek
  },
  filename: (req, file, cb) => {
    // Store the original filename with Turkish characters in req.originalFileName
    req.originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // Only change the storage filename, not the displayed name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // benzersiz isim
  },
});

// Debug and updated file filter function
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.originalname);
  console.log('MIME type:', file.mimetype);
  
  // Define allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  // Special case for txt files
  if (file.originalname.toLowerCase().endsWith('.txt')) {
    console.log('TXT file detected, accepting');
    return cb(null, true);
  }
  
  // Check MIME type first
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log('File accepted by MIME type:', file.mimetype);
    return cb(null, true);
  }
  
  // Fallback to extension check
  const extension = path.extname(file.originalname).toLowerCase();
  console.log('Checking extension:', extension);
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.txt'];
  
  if (allowedExtensions.includes(extension)) {
    console.log('File accepted by extension:', extension);
    return cb(null, true);
  }
  
  console.log('File rejected. Invalid type:', file.mimetype, 'with extension:', extension);
  return cb(new Error("Sadece PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX, TXT dosyaları yüklenebilir."));
};

// Dosya yükleme middleware'ı
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

module.exports = upload;
