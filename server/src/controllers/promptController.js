/**
 * Prompt Controller
 * 
 * Handles all CRUD operations for user prompts
 * - Create new prompts
 * - Read/retrieve prompts
 * - Update existing prompts
 * - Delete prompts
 * 
 * All operations are user-specific (filtered by userId)
 * This ensures users can only access their own prompts
 */

const { validationResult } = require('express-validator');
const Prompt = require('../models/Prompt');

/**
 * Get All Prompts for Current User
 * 
 * Retrieves all prompts belonging to the authenticated user
 * Sorted by creation date (newest first)
 * 
 * @route   GET /v1/prompts
 * @access  Private (requires authentication)
 * 
 * Response:
 * - success: boolean
 * - data: Array of prompt objects
 */
const getAllPrompts = async (req, res) => {
  try {
    // Find all prompts where userId matches the authenticated user
    // req.user.id is set by the auth middleware
    // .sort({ createdAt: -1 }) sorts newest first
    const prompts = await Prompt.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: prompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get Single Prompt by ID
 * 
 * Retrieves a specific prompt by its ID
 * Ensures the prompt belongs to the authenticated user
 * 
 * @route   GET /v1/prompts/:id
 * @access  Private (requires authentication)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the prompt
 * 
 * Response:
 * - success: boolean
 * - data: Prompt object
 */
const getPromptById = async (req, res) => {
  try {
    // Find prompt by ID AND userId (security check)
    // This prevents users from accessing other users' prompts
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    res.json({ success: true, data: prompt });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create New Prompt
 * 
 * Creates a new prompt for the authenticated user
 * 
 * @route   POST /v1/prompts
 * @access  Private (requires authentication)
 * 
 * Request Body:
 * - title: string (required) - Prompt title
 * - content: string (required) - Actual prompt text
 * - description: string (optional) - Description of what prompt does
 * - tags: array of strings (optional) - Tags for organization
 * - category: string (optional) - Category classification
 * - variables: array of strings (optional) - Variables used in prompt (e.g., {{name}})
 * 
 * Response:
 * - success: boolean
 * - data: Created prompt object with _id
 */
const createPrompt = async (req, res) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Extract fields from request body
    const { title, content, description, tags, category, variables, source, slug, marketplaceCategory } = req.body;

    // Create new prompt in database
    // userId is automatically set from authenticated user
    const prompt = await Prompt.create({
      title,
      slug,
      content,
      description,
      tags: tags || [], // Default to empty array if not provided
      category,
      marketplaceCategory, // Store marketplace category for analytics
      variables: variables || [], // Variables like {{name}}, {{topic}}
      source: source || 'created', // Default to 'created' if not specified
      userId: req.user.id // Link prompt to current user
    });

    // Return 201 Created status with new prompt
    res.status(201).json({ success: true, data: prompt });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update Existing Prompt
 * 
 * Updates a prompt's fields
 * Only the prompt owner can update it
 * 
 * @route   PUT /v1/prompts/:id
 * @access  Private (requires authentication)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the prompt
 * 
 * Request Body (all optional, only send fields to update):
 * - title: string
 * - content: string
 * - description: string
 * - tags: array of strings
 * - category: string
 * - variables: array of strings
 * 
 * Response:
 * - success: boolean
 * - data: Updated prompt object
 */
const updatePrompt = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Find prompt by ID and ensure it belongs to current user
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user.id });

    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Extract fields from request body
    const { title, content, description, tags, category, variables, marketplaceCategory } = req.body;

    // Update only provided fields (keeps existing values if not provided)
    prompt.title = title || prompt.title;
    prompt.content = content || prompt.content;
    prompt.description = description || prompt.description;
    prompt.tags = tags || prompt.tags;
    prompt.category = category || prompt.category;
    prompt.variables = variables || prompt.variables;
    // Preserve marketplaceCategory if provided (important for analytics)
    if (marketplaceCategory !== undefined) {
      prompt.marketplaceCategory = marketplaceCategory;
    }

    // Save to database (triggers pre-save hook to update updatedAt)
    await prompt.save();

    res.json({ success: true, data: prompt });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete Prompt
 * 
 * Permanently deletes a prompt from the database
 * Only the prompt owner can delete it
 * 
 * @route   DELETE /v1/prompts/:id
 * @access  Private (requires authentication)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the prompt
 * 
 * Response:
 * - success: boolean
 * - message: Confirmation message
 */
const deletePrompt = async (req, res) => {
  try {
    // Find prompt by ID and ensure it belongs to current user
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user.id });

    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Permanently delete from database
    await prompt.deleteOne();

    res.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Mark Prompt as Downloaded
 * 
 * @route   POST /v1/prompts/:id/download
 * @access  Private
 */
const markAsDownloaded = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user.id });

    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    prompt.downloadCount = (prompt.downloadCount || 0) + 1;
    prompt.isDownloaded = true;
    await prompt.save();

    res.json({ success: true, data: prompt });
  } catch (error) {
    console.error('Mark download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  markAsDownloaded
};
