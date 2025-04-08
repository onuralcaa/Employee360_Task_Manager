// migratePasswords.js - One-time script to migrate plain-text passwords to hashed passwords
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
const connectDB = require('./config/db');

// Function to hash a password
const hashPassword = async (plainTextPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainTextPassword, salt);
};

// Main migration function
const migratePasswords = async () => {
  console.log('Starting password migration...');
  
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    // Track success and failures
    let successCount = 0;
    let failureCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        // Store the plain text password temporarily
        const plainTextPassword = user.password;
        
        // Hash the password
        const hashedPassword = await hashPassword(plainTextPassword);
        
        // Update the user's password with the hashed version
        user.password = hashedPassword;
        await user.save();
        
        console.log(`Successfully migrated password for user: ${user.username}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to migrate password for user ${user.username}:`, error);
        failureCount++;
      }
    }
    
    console.log('\nPassword migration complete!');
    console.log(`Successful migrations: ${successCount}`);
    console.log(`Failed migrations: ${failureCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the migration
migratePasswords();