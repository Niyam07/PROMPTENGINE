// Marketplace Controller - browse and install prompt packs
const Pack = require('../models/MarketplacePrompt');
const Prompt = require('../models/Prompt');

// Get all marketplace packs
// GET /v1/packs
const getAllPacks = async (req, res) => {
  try {
    // Get all packs, sorted by popularity
    const packs = await Pack.find()
      .populate('authorId', 'name') // include author name
      .sort({ installs: -1, createdAt: -1 }); // most installed first
    
    res.json({ success: true, data: packs });
  } catch (error) {
    console.error('Get marketplace packs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Install pack from marketplace
// POST /v1/packs/:id/install
const installPack = async (req, res) => {
  try {
    // Find pack
    const pack = await Pack.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    // Install all prompts from pack
    const installedPrompts = [];
    for (const asset of pack.assets) {
      // Create prompt for user
      const prompt = await Prompt.create({
        title: asset.title,
        slug: asset.slug,
        content: asset.content,
        tags: asset.tags,
        category: pack.name, // pack name as category
        marketplaceCategory: pack.category, // for analytics (visual/informational/student)
        source: 'marketplace',
        userId: req.user.id
      });
      installedPrompts.push(prompt);
    }

    // Update install count
    pack.installs += 1;
    await pack.save();

    res.status(201).json({
      success: true,
      message: 'Pack installed successfully',
      installed: installedPrompts.length,
      data: installedPrompts
    });
  } catch (error) {
    console.error('Install pack error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllPacks, installPack };
