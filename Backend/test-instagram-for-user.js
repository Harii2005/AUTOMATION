const axios = require("axios");

async function connectInstagramForCurrentUser() {
  console.log("📸 Connecting Instagram for Current User\n");

  const BACKEND_URL = "http://localhost:5001/api";

  console.log("To connect Instagram for the current user (Harikrishnan):");
  console.log("You need to provide your login credentials.");
  console.log("");

  const userEmail = "your-email@example.com"; // Replace with your actual email
  const userPassword = "your-password"; // Replace with your actual password

  console.log("⚠️  UPDATE THE SCRIPT:");
  console.log("1. Edit this file: test-instagram-for-user.js");
  console.log("2. Replace userEmail with your actual email");
  console.log("3. Replace userPassword with your actual password");
  console.log("4. Run the script again");
  console.log("");
  console.log("Example:");
  console.log('const userEmail = "harikrishnan@example.com";');
  console.log('const userPassword = "mypassword123";');
  console.log("");
  console.log("OR use the frontend to connect:");
  console.log("1. Go to localhost:3000/social-accounts");
  console.log('2. Click "Connect" for Instagram');
  console.log("3. Refresh the calendar page");

  if (userEmail === "your-email@example.com") {
    console.log("\\n❌ Please update the credentials in this script first!");
    return;
  }

  try {
    // Login with user credentials
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: userEmail,
      password: userPassword,
    });

    const authToken = loginResponse.data.token;
    console.log("✅ User authenticated");

    // Connect Instagram
    const connectResponse = await axios.post(
      `${BACKEND_URL}/social/instagram/connect`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log("✅ Instagram connected successfully!");
    console.log("Account:", connectResponse.data.account);
    console.log("");
    console.log("🎉 Instagram is now connected!");
    console.log("Refresh your calendar page to see the updated status.");
  } catch (error) {
    console.log("❌ Connection failed:", error.response?.data);
    console.log("");
    console.log("💡 Make sure:");
    console.log("1. Email and password are correct");
    console.log("2. Backend server is running");
    console.log("3. You have an account in the system");
  }
}

connectInstagramForCurrentUser().catch(console.error);
