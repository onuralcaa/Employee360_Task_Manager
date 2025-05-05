require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Combine MONGODB_URI and MONGO_DB_NAME for a complete connection string
    const uri = `${process.env.MONGODB_URI}/${process.env.MONGO_DB_NAME}`;
    
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB bağlantı hatası: ${error.message}`);
    // Don't exit process in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
