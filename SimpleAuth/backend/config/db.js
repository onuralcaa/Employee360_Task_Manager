require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Combine MONGODB_URI and MONGO_DB_NAME for a complete connection string
    const uri = `${process.env.MONGODB_URI}/${process.env.MONGO_DB_NAME}`;
    
    // Add connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(uri, options);
    
    console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB bağlantı hatası: ${error.message}`);
    console.error("Please check if MongoDB is running and your connection URI is correct.");
    // Don't exit process in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
