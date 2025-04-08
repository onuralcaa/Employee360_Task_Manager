const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  surname: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [emailRegex, 'Please enter a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    validate: {
      validator: function(value) {
        return value.length >= 6;
      },
      message: 'Password must be at least 6 characters'
    }
  },
  role: { 
    type: String, 
    enum: {
      values: ["admin", "personel"],
      message: '{VALUE} is not a valid role'
    },
    default: "personel"
  },
  department: { 
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  position: { 
    type: String,
    trim: true,
    maxlength: [100, 'Position name cannot exceed 100 characters']
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index creation for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Pre-save middleware for validation
userSchema.pre('save', function(next) {
  // Only run this validation if password is modified
  if (!this.isModified('password')) return next();
  
  if (!passwordRegex.test(this._password)) {
    const error = new Error('Password must contain at least one letter, one number, and be at least 6 characters long');
    error.status = 400;
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model("User", userSchema);
