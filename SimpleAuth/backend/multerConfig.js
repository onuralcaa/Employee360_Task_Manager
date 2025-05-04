// fileController.js
const multer = require("multer");
const path = require("path");

// Use memory storage instead of disk storage to store files in MongoDB
const storage = multer.memoryStorage();

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
