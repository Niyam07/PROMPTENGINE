// Prompt Model - stores AI prompts created by users or from marketplace
const mongoose = require('mongoose');

// Prompt schema
const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true,
    default: 'User Created'
  },
  source: {
    type: String,
    enum: ['created', 'marketplace'], // either user created or from marketplace
    default: 'created'
  },
  marketplaceCategory: {
    type: String,
    enum: ['visual', 'informational', 'student', 'user-created'],
    trim: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  // Link to user who owns this prompt
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // references User model
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp whenever prompt is saved
promptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Prompt', promptSchema);
