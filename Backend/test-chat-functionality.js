require("dotenv").config();
const OpenAI = require("openai");

// Test the exact same configuration as used in the chat route
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "Social Media Content Generator",
  },
});

async function testChatFunctionality() {
  try {
    console.log("🧪 Testing Chat Functionality (Same as API Route)...");

    const prompt =
      "Write a short motivational message about learning new skills";
    const contentType = "text_post";
    const platform = "general";
    const tone = "professional";
    const length = "short";

    console.log("📝 Test Parameters:");
    console.log("- Prompt:", prompt);
    console.log("- Content Type:", contentType);
    console.log("- Platform:", platform);
    console.log("- Tone:", tone);
    console.log("- Length:", length);

    // Create system prompt based on content type (same logic as in chat.js)
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

    console.log("\n🔧 System Prompt:", systemPrompt);

    let messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    console.log("\n📤 Sending request to DeepSeek...");

    // Call DeepSeek API via OpenRouter (same as in chat.js)
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: messages,
      max_tokens: length === "short" ? 150 : length === "long" ? 500 : 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("✅ DeepSeek Response:");
    console.log("📝", aiResponse);

    console.log("\n📊 Response Metadata:");
    console.log("- Model:", completion.model);
    console.log("- Tokens Used:", completion.usage?.total_tokens || "N/A");
    console.log(
      "- Completion Tokens:",
      completion.usage?.completion_tokens || "N/A"
    );
    console.log("- Prompt Tokens:", completion.usage?.prompt_tokens || "N/A");

    console.log("\n🎉 Chat functionality test successful!");
    console.log(
      "✅ DeepSeek API is fully integrated and working in your chat system!"
    );

    return {
      success: true,
      response: aiResponse,
      metadata: {
        contentType,
        platform,
        tone,
        length,
        model: completion.model,
        usage: completion.usage,
      },
    };
  } catch (error) {
    console.error("❌ Chat Functionality Test Failed:");
    console.error("Error:", error.message);

    if (error.code === "insufficient_quota") {
      console.error("💡 Quota exceeded. Please check your API usage limits.");
    } else if (error.code === "invalid_api_key") {
      console.error(
        "💡 Invalid API key. Please verify your DEEPSEEK_API environment variable."
      );
    } else {
      console.error("💡 Full error details:", error);
    }

    return { success: false, error: error.message };
  }
}

// Run the test
testChatFunctionality();
