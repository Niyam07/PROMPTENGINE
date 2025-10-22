// User Model - defines how user data is stored in MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema - structure of user document
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true // removes whitespace
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // no duplicate emails
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // email validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now // automatically set when user is created
  }
});

// Hash password before saving to database
// This runs automatically when creating or updating a user
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  // Hash password with bcrypt (10 = salt rounds for security)
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if password is correct (used during login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
