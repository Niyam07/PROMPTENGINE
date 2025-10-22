// Marketplace Routes - browse and install prompt packs
const express = require('express');
const router = express.Router();
const { getAllPacks, installPack } = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /v1/packs - get all marketplace packs
router.get('/', getAllPacks);

// POST /v1/packs/:id/install - install pack to user library
router.post('/:id/install', installPack);

module.exports = router;
