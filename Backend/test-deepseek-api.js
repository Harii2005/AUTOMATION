const { config } = require("dotenv");
config();

const axios = require("axios");

console.log("Testing DeepSeek API via OpenRouter...");
console.log("API Key present:", process.env.OPENROUTER_API_KEY ? "Yes" : "No");

async function testDeepSeekAPI() {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "user",
            content:
              "Hello! Write a short, engaging social media post about the benefits of AI in content creation. Keep it under 100 words.",
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": process.env.SITE_NAME || "Social Media Content Generator",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success! DeepSeek Response:");
    console.log("=" * 50);
    console.log(response.data.choices[0].message.content);
    console.log("=" * 50);
    console.log("Model used:", response.data.model);
    console.log("Tokens used:", response.data.usage?.total_tokens || "N/A");

    return true;
  } catch (error) {
    console.error("❌ Error testing DeepSeek API:");
    console.error("Status:", error.response?.status);
    console.error("Error:", JSON.stringify(error.response?.data, null, 2));
    return false;
  }
}

// Test with different content types like your chat route
async function testContentGeneration() {
  console.log("\n🔄 Testing content generation scenarios...");

  const scenarios = [
    {
      name: "Instagram Post",
      prompt: "Create an engaging Instagram post about productivity tips",
      systemPrompt:
        "You are a social media content creator. Create engaging professional text posts for instagram. Length: medium. Focus on creating valuable, shareable content.",
    },
    {
      name: "Twitter Tweet",
      prompt: "Write a tweet about the importance of work-life balance",
      systemPrompt:
        "You are a social media content creator. Create engaging professional text posts for twitter. Length: short. Focus on creating valuable, shareable content.",
    },
  ];

  for (const scenario of scenarios) {
    try {
      console.log(`\n📱 Testing ${scenario.name}...`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: [
            { role: "system", content: scenario.systemPrompt },
            { role: "user", content: scenario.prompt },
          ],
          max_tokens: scenario.name.includes("Twitter") ? 100 : 200,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
            "X-Title":
              process.env.SITE_NAME || "Social Media Content Generator",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ ${scenario.name} Result:`);
      console.log(response.data.choices[0].message.content);
      console.log(`Tokens: ${response.data.usage?.total_tokens || "N/A"}`);
    } catch (error) {
      console.error(`❌ Failed ${scenario.name}:`, error.response?.data);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting DeepSeek API Integration Tests\n");

  const basicTest = await testDeepSeekAPI();

  if (basicTest) {
    await testContentGeneration();
    console.log(
      "\n🎉 DeepSeek integration is working! You can now use it in your chat route."
    );
  } else {
    console.log(
      "\n❌ Basic test failed. Please check your API key and try again."
    );
  }
}

runAllTests();
