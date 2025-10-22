// Auth Middleware - protects routes by checking JWT token
// Usage: router.get('/prompts', protect, getPrompts);

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify user is logged in
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from "Bearer <token>" format
      token = req.headers.authorization.split(' ')[1];

      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (without password)
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user exists
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // User is authenticated, continue to next function
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Token is invalid or expired
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
