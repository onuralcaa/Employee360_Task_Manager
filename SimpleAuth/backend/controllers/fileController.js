const File = require("../models/fileModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const os = require('os'); // Add OS module to detect platform

// 📤 Dosya Yükleme Fonksiyonu - Now stores files in MongoDB
const uploadFile = async (req, res) => {
  try {
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ message: "Alıcı seçilmedi." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi. Lütfen tekrar deneyin." });
    }

    if (req.user.role !== "admin" && req.user.role !== "team_leader") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // Get original filename with proper encoding if available
    const originalFileName = req.file.originalname;

    // Generate a unique filename (we'll still use this as an identifier even though we're not using filesystem)
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(originalFileName);

    // Store file info including the binary data
    const fileInfo = {
      filename: uniqueFilename,
      originalName: originalFileName,
      size: req.file.size,
      mimetype: req.file.mimetype || getMimeTypeFromExtension(originalFileName),
      data: req.file.buffer, // Store the file binary data directly in MongoDB
      sender: req.user.id,
      recipient: recipient
    };

    const newFile = new File(fileInfo);
    await newFile.save();

    // Don't include the binary data in the response
    const responseFileInfo = {
      _id: newFile._id,
      filename: newFile.filename,
      originalName: newFile.originalName,
      size: newFile.size,
      mimetype: newFile.mimetype,
      sender: newFile.sender,
      recipient: newFile.recipient,
      createdAt: newFile.createdAt
    };

    res.status(200).json({
      message: "Dosya başarıyla yüklendi ve gönderildi.",
      file: responseFileInfo
    });
  } catch (error) {
    console.error("Upload sırasında hata:", error);
    res.status(500).json({ message: "Dosya yüklenemedi. Hata: " + error.message });
  }
};

// Helper to determine MIME type from file extension
function getMimeTypeFromExtension(filename) {
  if (!filename) return 'application/octet-stream';
  
  const extension = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.csv': 'text/csv'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

// Kullanıcıya gelen dosyaları listele
const getFilesForRecipient = async (req, res) => {
  try {
    // Don't retrieve the binary data field for listings (improves performance)
    const files = await File.find({ recipient: req.user.id }, { data: 0 })
      .populate("sender", "name surname role")
      .sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Dosyalar alınamadı. Hata: " + error.message });
  }
};

// Kullanıcının gönderdiği dosyaları listele
const getFilesSentBySender = async (req, res) => {
  try {
    // Don't retrieve the binary data field for listings (improves performance)
    const files = await File.find({ sender: req.user.id }, { data: 0 })
      .populate("recipient", "name surname role")
      .sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Gönderdiğiniz dosyalar alınamadı. Hata: " + error.message });
  }
};

// Dosya indirme fonksiyonu - Handles both MongoDB stored files and legacy files with better error handling
const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!fileId) {
      return res.status(400).json({ message: "Dosya ID'si gereklidir." });
    }
    
    // Dosyayı veritabanından bul
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: "Dosya bulunamadı." });
    }
    
    // Fix Turkish character encoding issues in filename if needed
    if (file.originalName && file.originalName.includes('Ä')) {
      try {
        // Attempt to fix common Turkish character encoding issues
        const fixedName = fixTurkishEncoding(file.originalName);
        // Only save if the name actually changed
        if (fixedName !== file.originalName) {
          file.originalName = fixedName;
          // Use findOneAndUpdate instead of save() to bypass validation
          await File.findByIdAndUpdate(file._id, { originalName: fixedName });
          console.log(`Fixed encoding for filename: ${file.originalName}`);
        }
      } catch (encErr) {
        console.error("Error fixing filename encoding:", encErr);
        // Continue with the original filename if fixing fails
      }
    }
    
    // Log file information for debugging
    console.log("Download request for file:", {
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      hasData: !!file.data
    });
    
    // Kullanıcının bu dosyayı indirme yetkisi var mı kontrol et
    if (
      req.user.role !== "admin" && 
      file.sender.toString() !== req.user.id && 
      file.recipient.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Bu dosyayı indirme yetkiniz yok." });
    }
    
    // Get the original filename with proper encoding
    const originalFileName = file.originalName || "downloaded-file";
    
    // Determine file extension
    const extension = path.extname(originalFileName).toLowerCase();
    console.log(`File extension: ${extension}`);
    
    // Determine content type based on file extension
    let contentType;
    
    // Special handling for Office documents
    if (extension === '.doc') {
      contentType = 'application/msword';
    } else if (extension === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (file.mimetype) {
      contentType = file.mimetype;
    } else {
      // Fallback mime type mapping
      contentType = getMimeTypeFromExtension(originalFileName);
    }
    
    console.log(`Using content type: ${contentType} for file: ${originalFileName}`);
    
    // BACKWARD COMPATIBILITY HANDLING:
    // Check if this file has the binary data in MongoDB (new style)
    if (file.data && Buffer.isBuffer(file.data)) {
      console.log("Serving file from MongoDB storage");
      
      // Calculate content length from actual buffer size if file.size is undefined
      const contentLength = file.size || file.data.length;
      
      // Set appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', contentLength);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalFileName)}`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send the file data directly from the database
      return res.send(file.data);
    } 
    // If not, try to find it in the filesystem (legacy style)
    else {
      console.log("Attempting to serve legacy file from filesystem");
      
      // Normalize all path separators for cross-platform compatibility
      // Try the local filesystem as a fallback for legacy files
      // Legacy files might have different paths, try multiple possible locations
      const possiblePaths = [
        // Standard path in uploads folder with normalized separator
        path.normalize(path.join(__dirname, '..', 'uploads', file.filename)),
        // Just in case it was stored with a different path structure
        file.path ? path.normalize(file.path) : path.normalize(path.join(__dirname, '..', 'uploads', file.filename)),
        // Try with an alternate uploads location
        path.normalize(path.join(__dirname, '..', '..', 'uploads', file.filename)),
        // Try temp directory as a fallback
        path.normalize(path.join(os.tmpdir(), 'employee360_uploads', file.filename))
      ];
      
      // Try each possible path
      let filePath = null;
      for (const tryPath of possiblePaths) {
        try {
          if (fs.existsSync(tryPath)) {
            // Additional verification: make sure it's a file, not a directory
            const stats = fs.statSync(tryPath);
            if (stats.isFile()) {
              filePath = tryPath;
              console.log(`Found legacy file at: ${filePath}`);
              break;
            }
          }
        } catch (fsErr) {
          console.error(`Error checking path ${tryPath}:`, fsErr.message);
          // Continue to next path
        }
      }
      
      if (!filePath) {
        // Mark file as problematic for admin cleanup
        try {
          // Use findByIdAndUpdate instead of save() to bypass validation
          await File.findByIdAndUpdate(file._id, { 
            corrupted: true,
            corruptedReason: "File not found in database or filesystem" 
          });
          console.log(`Marked file ${file._id} as corrupted`);
        } catch (markErr) {
          console.error("Error marking file as corrupted:", markErr);
        }
        
        // If the file doesn't exist in either MongoDB or the filesystem
        return res.status(404).json({ 
          message: "Dosya verisi bulunamadı. Bu dosya eski bir sistemden kayıtlı olabilir ve artık mevcut değil. Lütfen sistem yöneticisiyle iletişime geçin." 
        });
      }
      
      // Get file stats for Content-Length with better error handling
      let stats;
      try {
        stats = fs.statSync(filePath);
      } catch (statsErr) {
        console.error(`Error getting file stats: ${statsErr.message}`);
        return res.status(500).json({ 
          message: "Dosya bilgileri alınamadı. Lütfen sistem yöneticisiyle iletişime geçin." 
        });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalFileName)}`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Stream the file from the filesystem with improved error handling
      try {
        const fileStream = fs.createReadStream(filePath);
        
        fileStream.on('error', (err) => {
          console.error(`Error streaming legacy file: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ 
              message: "Dosya okunurken hata oluştu.",
              details: err.message 
            });
          }
        });
        
        // Pipe the file to the response
        fileStream.pipe(res);
        
        // After sending the file, attempt to migrate it to MongoDB for future downloads
        fileStream.on('end', async () => {
          try {
            // Don't block the response - do this asynchronously
            setTimeout(async () => {
              await migrateFileToMongoDB(file, filePath);
            }, 0);
          } catch (migrationErr) {
            console.error(`Migration error for file ${file._id}:`, migrationErr);
            // Don't affect the user's download if migration fails
          }
        });
      } catch (streamErr) {
        console.error(`Error creating read stream: ${streamErr.message}`);
        return res.status(500).json({ 
          message: "Dosya okunurken hata oluştu. Dosya sistemi erişim sorunu olabilir." 
        });
      }
    }
    
  } catch (error) {
    console.error("Dosya indirme hatası:", error);
    res.status(500).json({ 
      message: "Dosya indirilemedi. Hata: " + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Helper function to migrate a file from filesystem to MongoDB
async function migrateFileToMongoDB(fileDoc, filePath) {
  try {
    console.log(`Migrating file ${fileDoc._id} from filesystem to MongoDB`);
    
    // Check if file already has data
    if (fileDoc.data && Buffer.isBuffer(fileDoc.data)) {
      console.log(`File ${fileDoc._id} already has data in MongoDB. Skipping migration.`);
      return;
    }
    
    // Read file data with better error handling
    let fileData;
    let stats;
    
    try {
      fileData = fs.readFileSync(filePath);
      stats = fs.statSync(filePath);
    } catch (fsErr) {
      console.error(`Error reading file from disk during migration: ${fsErr.message}`);
      throw new Error(`File system error: ${fsErr.message}`);
    }
    
    // Update the document with the file data
    fileDoc.data = fileData;
    fileDoc.size = stats.size; // Update size if it was missing
    
    // If mimetype is missing, try to determine it
    if (!fileDoc.mimetype) {
      fileDoc.mimetype = getMimeTypeFromExtension(fileDoc.originalName || fileDoc.filename);
    }
    
    // Save updated document
    await fileDoc.save();
    console.log(`✅ Successfully migrated file ${fileDoc._id} to MongoDB`);
    
    // Optional: Remove the file from disk after successful migration
    // Keeping this commented out for now as it's safer to keep the files during transition
    // try {
    //   fs.unlinkSync(filePath);
    //   console.log(`Removed file from disk after migration: ${filePath}`);
    // } catch (unlinkErr) {
    //   console.error(`Error removing file from disk: ${unlinkErr.message}`);
    //   // Don't throw here, as the migration was still successful
    // }
  } catch (err) {
    console.error(`❌ Error migrating file ${fileDoc._id} to MongoDB:`, err);
    throw err; // Re-throw to be handled by the caller
  }
}

// Helper function to fix common Turkish character encoding issues
function fixTurkishEncoding(text) {
  if (!text) return text;
  
  const replacements = {
    'Ä±': 'ı', // i without dot
    'Ä°': 'İ', // I with dot
    'Ä': 'ı', // Fix for a common encoding issue
    'Ã¼': 'ü',
    'Ã§': 'ç',
    'ÄŸ': 'ğ',
    'Ã¶': 'ö',
    'ÅŸ': 'ş'
  };
  
  let result = text;
  for (const [incorrect, correct] of Object.entries(replacements)) {
    result = result.replace(new RegExp(incorrect, 'g'), correct);
  }
  
  return result;
}

// 📌 Alıcıları getirme fonksiyonu
const getRecipientsList = async (req, res) => {
  try {
    let recipients;
    if (req.user.role === "admin") {
      recipients = await User.find({ role: { $in: ["team_leader", "personel"] } });
    } else if (req.user.role === "team_leader") {
      recipients = await User.find({
        $or: [
          { role: "admin" },
          { role: "team_leader", _id: { $ne: req.user.id } },
          { role: "personel", team: req.user.team }
        ]
      });
    } else {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }
    res.status(200).json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Alıcılar alınamadı. Hata: " + error.message });
  }
};

// Dosya silme - Sadece yöneticilere özel
const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!fileId) {
      return res.status(400).json({ message: "Dosya ID'si gereklidir." });
    }
    
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Yalnızca yöneticiler dosyaları silebilir." });
    }
    
    // Find file in database
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: "Dosya bulunamadı." });
    }
    
    // Delete from database - with MongoDB storage, this is the only action needed
    await File.findByIdAndDelete(fileId);
    
    res.status(200).json({ message: "Dosya başarıyla silindi." });
  } catch (error) {
    console.error("Dosya silme hatası:", error);
    res.status(500).json({ message: "Dosya silinemedi. Hata: " + error.message });
  }
};

module.exports = { 
  uploadFile, 
  getFilesForRecipient, 
  getFilesSentBySender, 
  getRecipientsList,
  downloadFile,
  deleteFile
};
