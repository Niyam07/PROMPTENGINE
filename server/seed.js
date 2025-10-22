const mongoose = require('mongoose');
const User = require('./models/User');
const Prompt = require('./models/Prompt');
const Pack = require('./models/MarketplacePrompt');
require('dotenv').config();

// Sample data
const samplePacks = [
  {
    name: 'Content Creation Starter Pack',
    version: '1.0.0',
    price: 0,
    rating: 4.8,
    installs: 1250,
    tags: ['content', 'writing', 'social-media'],
    description: 'Essential prompts for content creators and social media managers',
    assets: [
      {
        title: 'Blog Post Generator',
        slug: 'blog-post-generator',
        tags: ['blog', 'content', 'writing'],
        content: `# ROLE
You are a professional blog writer with expertise in SEO and engaging storytelling.

# TASK
Write a comprehensive blog post on {{TOPIC}} that is {{TONE}} and targets {{AUDIENCE}}.

# CONSTRAINTS
- Length: {{WORD_COUNT}} words
- Include relevant examples and statistics
- Use clear headings and subheadings
- Optimize for SEO with natural keyword placement

# OUTPUT
Provide the complete blog post with proper formatting.`
      },
      {
        title: 'Social Media Caption Creator',
        slug: 'social-caption-creator',
        tags: ['social-media', 'marketing', 'content'],
        content: `# ROLE
You are a social media expert specializing in engaging captions.

# TASK
Create {{NUMBER}} social media captions for {{PLATFORM}} about {{TOPIC}}.

# CONSTRAINTS
- Keep within platform character limits
- Include relevant hashtags
- Use emojis appropriately
- Match brand voice: {{TONE}}

# OUTPUT
Provide the captions with hashtags and emoji suggestions.`
      }
    ]
  },
  {
    name: 'Developer Assistant Pack',
    version: '1.2.0',
    price: 0,
    rating: 4.9,
    installs: 2100,
    tags: ['coding', 'development', 'technical'],
    description: 'Boost your development workflow with AI-powered coding assistants',
    assets: [
      {
        title: 'Code Review Assistant',
        slug: 'code-review-assistant',
        tags: ['code-review', 'quality', 'best-practices'],
        content: `# ROLE
You are a senior software engineer conducting code reviews.

# TASK
Review the following {{LANGUAGE}} code and provide constructive feedback.

# CONSTRAINTS
- Focus on: readability, performance, security, best practices
- Suggest specific improvements
- Explain reasoning behind each suggestion
- Be constructive and educational

# OUTPUT
Provide structured feedback with code examples where helpful.`
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_engine');
    console.log('✅ MongoDB connected');

    // Create or find demo user
    let demoUser = await User.findOne({ email: 'demo@promptengine.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@promptengine.com',
        password: 'demo123456'
      });
      console.log('✅ Demo user created');
    }

    // Clear existing packs
    await Pack.deleteMany({});
    console.log('✅ Cleared existing marketplace packs');

    // Add authorId to packs
    const packsWithAuthor = samplePacks.map(pack => ({
      ...pack,
      authorId: demoUser._id
    }));

    // Insert packs
    await Pack.insertMany(packsWithAuthor);
    console.log(`✅ Seeded ${samplePacks.length} marketplace packs`);

    // Create sample prompts for the demo user
    await Prompt.deleteMany({ userId: demoUser._id });
    
    const samplePrompts = [
      {
        title: 'Email Writer Pro',
        slug: 'email-writer-pro',
        tags: ['email', 'business', 'communication'],
        source: 'created',
        content: `# ROLE
You are a professional business communication expert.

# TASK
Write a {{TONE}} email to {{RECIPIENT}} about {{SUBJECT}}.

# CONSTRAINTS
- Keep it concise and professional
- Clear subject line
- Proper greeting and closing
- Action-oriented where appropriate

# OUTPUT
Provide the complete email ready to send.`,
        userId: demoUser._id
      },
      {
        title: 'Meeting Notes Summarizer',
        slug: 'meeting-notes-summarizer',
        tags: ['productivity', 'business', 'notes'],
        source: 'created',
        content: `# ROLE
You are an executive assistant skilled at summarizing meetings.

# TASK
Summarize the following meeting notes into key points, action items, and decisions.

# CONSTRAINTS
- Organize by: Key Decisions, Action Items, Important Points
- Assign owners to action items if mentioned
- Keep it concise but comprehensive

# OUTPUT
Provide a well-structured summary.`,
        userId: demoUser._id
      },
      {
        title: 'Product Description Writer',
        slug: 'product-description-writer',
        tags: ['ecommerce', 'marketing', 'copywriting'],
        source: 'created',
        content: `# ROLE
You are an expert e-commerce copywriter.

# TASK
Write a compelling product description for {{PRODUCT_NAME}}.

# CONSTRAINTS
- Highlight key features and benefits
- Target audience: {{TARGET_AUDIENCE}}
- Tone: {{TONE}}
- Length: {{WORD_COUNT}} words
- Include a clear call-to-action

# OUTPUT
Provide the product description optimized for conversion.`,
        userId: demoUser._id
      }
    ];

    await Prompt.insertMany(samplePrompts);
    console.log(`✅ Seeded ${samplePrompts.length} sample prompts`);

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
