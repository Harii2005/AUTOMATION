const axios = require("axios");

async function quickAccountCheck() {
  const ACCESS_TOKEN =
    "IGAASZBSOMqFQ5BZAFFWSE9NUW1ybktTYlVmeHl5S25OVzV2OTBTZAmNES19nVXJuSWNQVUx3SlJoS3c5dE4xTEFKUXJQT2k5Uk5GU3JqRzFUVnF4eW5Mdy1ibWNyRTM0U1R2ZA1hhVW9sSG51bnNpUWtJTU5pcDF0TlJ0ZAGs3Rm5jawZDZD";

  try {
    const response = await axios.get(
      `https://graph.instagram.com/me?fields=account_type,username&access_token=${ACCESS_TOKEN}`
    );

    console.log("Account:", response.data.username);
    console.log("Type:", response.data.account_type);

    if (
      response.data.account_type === "CREATOR" ||
      response.data.account_type === "BUSINESS"
    ) {
      console.log("✅ Perfect! Ready for Instagram Graph API posting");
    } else {
      console.log("❌ Still need to convert to CREATOR or BUSINESS account");
    }
  } catch (error) {
    console.log("Error:", error.response?.data);
  }
}

quickAccountCheck();
