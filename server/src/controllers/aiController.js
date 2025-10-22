// AI Controller - handles AI chat, prompt enhancement, and generation
const { validationResult } = require('express-validator');
const axios = require('axios');

// OpenRouter API config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'meta-llama/llama-4-scout:free'; // free AI model

// Helper function to call OpenRouter API
const callOpenRouterAPI = async (prompt, conversationHistory = []) => {
  try {
    // Check if API key is set
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY is not set in .env file');
      throw new Error('OpenRouter API key is not configured');
    }
    
    console.log('🔑 Using OpenRouter API with model:', MODEL_NAME);
    
    // Build messages array
    const messages = [];
    
    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    console.log('📤 Sending request to OpenRouter...');
    
    // Call OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7, // creativity level
        max_tokens: 1000, // max response length
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:8080',
          'X-Title': 'AI Prompt Engine'
        }
      }
    );

    console.log('✅ Received response from OpenRouter');
    
    // Return AI response
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.error?.message || 'Failed to communicate with AI service');
  }
};

/**
 * Chat endpoint - Handles conversational AI interactions
 * @desc    Chat with AI using OpenRouter API
 * @route   POST /v1/generate
 * @access  Private (requires authentication token)
 */
const chat = async (req, res) => {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { message, conversationHistory } = req.body;

    // Call OpenRouter API with the message and conversation history
    const response = await callOpenRouterAPI(message, conversationHistory);

    // Return successful response with AI's message
    res.json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Enhance Prompt endpoint - Improves user's prompts using AI
 * @desc    Enhance prompt with AI suggestions
 * @route   POST /v1/enhance
 * @access  Private (requires authentication token)
 */
const enhancePrompt = async (req, res) => {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { prompt } = req.body;

    // Create instruction prompt for AI to enhance the user's prompt
    const enhanceInstructions = `You are an expert prompt engineer. Enhance and improve the following prompt to make it more effective, clear, and professional. Keep any variables in {{variable}} format intact. Return only the enhanced prompt without explanations.

Original prompt:
${prompt}

Enhanced prompt:`;

    // Call OpenRouter API to enhance the prompt
    const enhancedPrompt = await callOpenRouterAPI(enhanceInstructions);

    // Return the enhanced prompt to the client
    res.json({
      success: true,
      enhancedPrompt: enhancedPrompt.trim()
    });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Generate Prompt endpoint - Creates prompts from descriptions
 * @desc    Generate prompt from user description using AI
 * @route   POST /v1/generate (with different body params)
 * @access  Private (requires authentication token)
 */
const generatePrompt = async (req, res) => {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { description } = req.body;

    // Create instruction prompt for AI to generate a new prompt based on description
    const generateInstructions = `You are an expert prompt engineer. Based on the following description, create a professional and effective prompt. Use {{variable}} format for any variables that should be filled in by the user. Return only the generated prompt without explanations.

Description:
${description}

Generated prompt:`;

    // Call OpenRouter API to generate the prompt
    const generatedPrompt = await callOpenRouterAPI(generateInstructions);

    // Return the generated prompt to the client
    res.json({
      success: true,
      generatedPrompt: generatedPrompt.trim()
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { chat, enhancePrompt, generatePrompt };
