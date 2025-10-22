// AI Routes - handles AI chat, prompt enhancement, and generation
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { chat, enhancePrompt, generatePrompt } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Validation for chat
const chatValidation = [
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Validation for enhance
const enhanceValidation = [
  body('prompt').trim().notEmpty().withMessage('Prompt is required')
];

// Validation for generate
const generateValidation = [
  body('description').trim().notEmpty().withMessage('Description is required')
];

// All routes require authentication
router.use(protect);

// POST /v1/ai/chat - chat with AI
router.post('/chat', chatValidation, chat);

// POST /v1/ai/enhance - enhance existing prompt
router.post('/enhance', enhanceValidation, enhancePrompt);

// POST /v1/ai/generate - generate new prompt from description
router.post('/generate', generateValidation, generatePrompt);

module.exports = router;
