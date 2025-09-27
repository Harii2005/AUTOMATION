require('dotenv').config();
const axios = require('axios');

async function testChatEndpoint() {
  try {
    console.log("🧪 Testing Chat API Endpoint...");
    
    const baseURL = 'http://localhost:5001'; // Adjust port if needed
    
    // Test the generate-content endpoint
    const testData = {
      prompt: "Write a short motivational message about learning new skills",
      contentType: "text_post",
      platform: "general",
      tone: "professional",
      length: "short"
    };
    
    console.log("📤 Sending request to /api/chat/generate-content");
    console.log("Request data:", testData);
    
    const response = await axios.post(`${baseURL}/api/chat/generate-content`, testData, {
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real scenario, you'd need a valid JWT token
        // 'Authorization': 'Bearer your-jwt-token'
      }
    });
    
    console.log("✅ Chat API Response:");
    console.log("Status:", response.status);
    console.log("Generated Content:", response.data.generatedContent);
    console.log("Metadata:", response.data.metadata);
    
    console.log("\n🎉 Chat endpoint is working successfully!");
    
  } catch (error) {
    console.error("❌ Chat API Test Failed:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data);
      
      if (error.response.status === 401) {
        console.log("💡 Note: This error is expected if authentication is required.");
        console.log("💡 To test with auth, you'll need to provide a valid JWT token.");
      }
    } else {
      console.error("Error:", error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log("💡 Make sure the backend server is running on the correct port.");
        console.log("💡 Try running: npm start or node src/index.js in the Backend directory");
      }
    }
  }
}

// Run the test
testChatEndpoint();