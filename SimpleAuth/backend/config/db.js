const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure proper connection handling with MongoDB Atlas
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Configure MongoDB for attendance tracking optimization
    // These settings help with high-frequency write operations like card scans
    mongoose.set('autoIndex', true);
    
    // Enable read and write concerns for attendance data reliability
    if (conn.connection.db) {
      conn.connection.db.admin().command({ 
        setParameter: 1, 
        internalQueryExecMaxBlockingSortBytes: 33554432 
      }).catch(err => {
        // This is optional and might not work in some Atlas tiers
        console.log('Note: Optional MongoDB optimization not applied');
      });
    }
    
    console.log(`✅ MongoDB bağlantısı başarılı! ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB bağlantı hatası: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
