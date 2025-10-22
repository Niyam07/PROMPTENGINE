/**
 * Marketplace Prompt (Pack) Model
 * 
 * Defines the schema for prompt packs in the marketplace
 * 
 * A "Pack" is a collection of related prompts that users can install
 * Example: "Marketing Pack" might contain prompts for ads, emails, social media
 * 
 * Features:
 * - Contains multiple prompt assets
 * - Tracks installs and ratings
 * - Links to author (User)
 * - Supports pricing (free or paid)
 * - Tags for categorization
 */

const mongoose = require('mongoose');

// Define the Pack schema structure
const packSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  price: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  installs: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['visual', 'informational', 'student'],
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Assets are the individual prompts contained in this pack
  // Each pack can have multiple prompts
  assets: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    content: {
      type: String,
      required: true
    }
  }],
  // Reference to the User who created this pack
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to User collection
    required: true
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

/**
 * Pre-save Hook: Update Timestamp
 * 
 * Automatically updates the 'updatedAt' field whenever
 * the pack is modified and saved
 */
packSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export the Pack model
module.exports = mongoose.model('Pack', packSchema);
