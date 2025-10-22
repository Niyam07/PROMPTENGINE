// Marketplace Seeder - populates database with prompt packs
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Pack schema for marketplace
const packSchema = new mongoose.Schema({
  name: String,
  category: String,
  version: { type: String, default: '1.0.0' },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  installs: { type: Number, default: 0 },
  tags: [String],
  description: String,
  assets: [{
    title: String,
    slug: String,
    tags: [String],
    content: String
  }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Pack = mongoose.model('Pack', packSchema);

// Import all pack categories
const { visualPacks } = require('./packs/visualPacks');
const { informationalPacks } = require('./packs/informationalPacks');
const { studentPacks } = require('./packs/studentPacks');

// Combine all packs
const promptPacks = [
  ...visualPacks,
  ...informationalPacks,
  ...studentPacks
];

// Helper function to generate random rating between 3.5 and 5.0
const getRandomRating = () => {
  return (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
};

// Helper function to generate random install count
const getRandomInstalls = () => {
  return Math.floor(Math.random() * 500) + 50; // 50 to 550 installs
};

const seedMarketplace = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing packs...');
    await Pack.deleteMany({});
    
    console.log('👤 Creating default author...');
    let defaultAuthor = await User.findOne({ email: 'admin@promptengine.com' });
    if (!defaultAuthor) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      defaultAuthor = await User.create({
        name: 'Prompt Engine Team',
        email: 'admin@promptengine.com',
        password: hashedPassword
      });
    }
    
    console.log('📦 Seeding marketplace packs with random ratings and installs...');
    const packsWithAuthor = promptPacks.map(pack => ({
      ...pack,
      authorId: defaultAuthor._id,
      rating: getRandomRating(), // random rating for each pack
      installs: getRandomInstalls() // random install count for each pack
    }));
    
    await Pack.insertMany(packsWithAuthor);
    
    console.log(`✅ Successfully seeded ${promptPacks.length} packs!`);
    console.log('\nCategory breakdown:');
    console.log(`  Visual: ${promptPacks.filter(p => p.category === 'visual').length} packs`);
    console.log(`  Informational: ${promptPacks.filter(p => p.category === 'informational').length} packs`);
    console.log(`  Student: ${promptPacks.filter(p => p.category === 'student').length} packs`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding marketplace:', error);
    process.exit(1);
  }
};

seedMarketplace();
