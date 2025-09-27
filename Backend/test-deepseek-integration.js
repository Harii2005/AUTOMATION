require("dotenv").config();
const OpenAI = require("openai");

// Initialize DeepSeek via OpenRouter API
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "DeepSeek API Test",
  },
});

async function testDeepSeekAPI() {
  try {
    console.log("🔍 Testing DeepSeek API integration...");
    console.log(
      "DeepSeek API Key present:",
      process.env.DEEPSEEK_API ? "✅ Yes" : "❌ No"
    );

    if (!process.env.DEEPSEEK_API) {
      console.error("❌ DeepSeek API key not found in environment variables");
      return;
    }

    console.log("\n📤 Sending test request to DeepSeek...");

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Respond concisely and friendly.",
        },
        {
          role: "user",
          content:
            "Hello! Please respond with a short greeting to confirm you're working.",
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    console.log("✅ DeepSeek API Response:");
    console.log("📝", response);
    console.log("\n🎉 DeepSeek API is working successfully!");

    // Test with a more complex prompt
    console.log("\n🔄 Testing with a content generation prompt...");

    const contentCompletion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a social media content creator. Create engaging professional text posts. Focus on creating valuable, shareable content.",
        },
        {
          role: "user",
          content:
            "Create a motivational post about productivity tips for remote workers",
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const contentResponse = contentCompletion.choices[0].message.content;

    console.log("✅ Content Generation Response:");
    console.log("📝", contentResponse);
    console.log(
      "\n🚀 All tests passed! DeepSeek API integration is fully functional."
    );
  } catch (error) {
    console.error("❌ DeepSeek API Test Failed:");
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
  }
}

// Run the test
testDeepSeekAPI();
