const { config } = require("dotenv");
config();

const axios = require("axios");

async function testAPIKey() {
  console.log("Testing API Key format and OpenRouter connectivity...");
  console.log(
    "API Key format check:",
    process.env.OPENROUTER_API_KEY?.startsWith("sk-or-v1-")
      ? "Correct format"
      : "Incorrect format"
  );

  // Test with a different free model first
  try {
    console.log("Testing with a basic free model first...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo:free",
        messages: [
          {
            role: "user",
            content: 'Hello! Just say "API is working!"',
          },
        ],
        max_tokens: 20,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Social Media Content Generator",
        },
      }
    );

    console.log("✅ Basic model works!");
    console.log("Response:", response.data.choices[0].message.content);

    // Now test Grok
    console.log("\nNow testing Grok 4 Fast...");

    const grokResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "x-ai/grok-4-fast:free",
        messages: [
          {
            role: "user",
            content: "Write a very short social media post about AI benefits.",
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Social Media Content Generator",
        },
      }
    );

    console.log("✅ Grok 4 Fast works!");
    console.log("Response:", grokResponse.data.choices[0].message.content);
  } catch (error) {
    console.log("❌ Error details:");
    console.log("Status:", error.response?.status);
    console.log("Error:", JSON.stringify(error.response?.data, null, 2));

    if (error.response?.status === 401) {
      console.log("\n🔍 This looks like an authentication issue.");
      console.log("Please verify your API key is correct and active.");
      console.log(
        "You can check your OpenRouter dashboard at: https://openrouter.ai/"
      );
    }
  }
}

testAPIKey();
