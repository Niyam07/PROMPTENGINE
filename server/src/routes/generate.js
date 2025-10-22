const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { generatePrompt, enhancePrompt } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Validation rules
const generateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
];

const enhanceValidation = [
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes are protected
router.use(protect);

// Routes
router.post('/', generateValidation, generatePrompt);
router.post('/enhance', enhanceValidation, enhancePrompt);

module.exports = router;
