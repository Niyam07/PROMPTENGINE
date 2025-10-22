// Auth Routes - handles user registration, login, and profile
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules for registration
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /v1/auth/register - create new user
router.post('/register', registerValidation, register);

// POST /v1/auth/login - login user
router.post('/login', loginValidation, login);

// GET /v1/auth/profile - get user profile (protected)
router.get('/profile', protect, getProfile);

module.exports = router;
