require('dotenv').config();

// Simple test endpoint that doesn't require authentication
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// Initialize DeepSeek via OpenRouter API
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "Social Media Content Generator",
  },
});

// Test endpoint without authentication
app.post("/test-chat", async (req, res) => {
  try {
    const {
      prompt = "Hello, how are you?",
      contentType = "text_post",
      platform = "general",
      tone = "professional",
      length = "short",
    } = req.body;

    console.log("📝 Received test request:", { prompt, contentType, platform, tone, length });

    // Create system prompt based on content type
    let systemPrompt = "";

    switch (contentType) {
      case "text_post":
        systemPrompt = `You are a social media content creator. Create engaging ${tone} text posts for ${platform}. Length: ${length}. Focus on creating valuable, shareable content.`;
        break;
      case "caption_with_image":
        systemPrompt = `You are a social media content creator. Create compelling captions for ${platform} posts with image ideas. Include relevant hashtags and suggest image concepts. Tone: ${tone}, Length: ${length}.`;
        break;
      case "video_script":
        systemPrompt = `You are a video content creator. Write engaging video scripts for ${platform}. Include hook, main content, and call-to-action. Tone: ${tone}, Length: ${length}.`;
        break;
      default:
        systemPrompt = `You are a helpful AI assistant for social media content creation. Create engaging content based on the user's request.`;
    }

    let messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    // Call DeepSeek API via OpenRouter
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: messages,
      max_tokens: length === "short" ? 150 : length === "long" ? 500 : 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("✅ DeepSeek Response:", aiResponse);

    res.json({
      success: true,
      generatedContent: aiResponse,
      message: "Response generated successfully",
      metadata: {
        contentType,
        platform,
        tone,
        length,
        model: completion.model,
        usage: completion.usage
      },
    });
  } catch (error) {
    console.error("❌ Generate content error:", error);

    if (error.code === "insufficient_quota") {
      return res.status(429).json({
        error: "DeepSeek API quota exceeded. Please check your API usage.",
      });
    }

    res.status(500).json({ 
      success: false,
      error: "Failed to generate content",
      details: error.message 
    });
  }
});

const PORT = 3333;
const server = app.listen(PORT, () => {
  console.log(`🚀 DeepSeek Test Server running on http://localhost:${PORT}`);
  console.log(`📝 Test the endpoint: curl -X POST http://localhost:${PORT}/test-chat -H "Content-Type: application/json" -d '{"prompt":"Write a motivational quote"}'`);
});

// Test the endpoint programmatically
setTimeout(async () => {
  try {
    const axios = require('axios');
    
    console.log("\n🧪 Running automated test...");
    
    const testData = {
      prompt: "Create a motivational post about overcoming challenges",
      contentType: "text_post",
      platform: "linkedin",
      tone: "inspirational",
      length: "medium"
    };
    
    const response = await axios.post(`http://localhost:${PORT}/test-chat`, testData);
    
    console.log("✅ API Test Results:");
    console.log("Status:", response.status);
    console.log("Success:", response.data.success);
    console.log("Generated Content:", response.data.generatedContent);
    console.log("Metadata:", response.data.metadata);
    
    console.log("\n🎉 DeepSeek API integration test completed successfully!");
    console.log("🔥 Your AI chat assistant is ready to use!");
    
    server.close();
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Automated test failed:", error.message);
    server.close();
    process.exit(1);
  }
}, 2000);