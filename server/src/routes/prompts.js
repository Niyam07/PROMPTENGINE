// Prompts Routes - CRUD operations for prompts
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  markAsDownloaded
} = require('../controllers/promptController');
const { protect } = require('../middleware/auth');

// Validation for creating/updating prompts
const promptValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes require authentication
router.use(protect);

// GET /v1/prompts - get all user prompts
router.get('/', getAllPrompts);

// GET /v1/prompts/:id - get single prompt
router.get('/:id', getPromptById);

// POST /v1/prompts - create new prompt
router.post('/', promptValidation, createPrompt);

// PUT /v1/prompts/:id - update prompt
router.put('/:id', promptValidation, updatePrompt);

// DELETE /v1/prompts/:id - delete prompt
router.delete('/:id', deletePrompt);

// POST /v1/prompts/:id/download - mark prompt as downloaded
router.post('/:id/download', markAsDownloaded);

module.exports = router;
