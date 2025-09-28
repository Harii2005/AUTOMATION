const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

async function testImageUpload() {
  try {
    // Create a simple test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, "test-image.png");
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    fs.writeFileSync(testImagePath, pngBuffer);
    console.log("✅ Test image created");

    // First, let's get a valid JWT token by creating a test user
    const registerResponse = await axios.post(
      "http://localhost:5001/api/auth/register",
      {
        name: "Test User",
        email: "test@example.com",
        password: "testpassword123",
      }
    );

    const token = registerResponse.data.token;
    console.log("✅ Got authentication token");

    // Create FormData for image upload
    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    // Test the upload endpoint
    const uploadResponse = await axios.post(
      "http://localhost:5001/api/posts/upload-image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Image upload successful!");
    console.log("📸 Upload response:", uploadResponse.data);

    // Test accessing the uploaded image
    const imageUrl = uploadResponse.data.imageUrl;
    const imageResponse = await axios.get(imageUrl);

    if (imageResponse.status === 200) {
      console.log("✅ Image is accessible at:", imageUrl);
    }

    // Clean up test image
    fs.unlinkSync(testImagePath);
    console.log("🧹 Cleaned up test image");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testImageUpload();
