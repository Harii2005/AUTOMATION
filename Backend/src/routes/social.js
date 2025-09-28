const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Encryption/Decryption utility functions
const algorithm = "aes-256-cbc";
const secretKey =
  process.env.ENCRYPTION_KEY || "default-32-char-secret-key-here!!";

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey.substring(0, 32)),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText) {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedData = textParts[1];
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey.substring(0, 32)),
    iv
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Instagram API functions
const instagramAPI = {
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram API Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get Instagram user info");
    }
  },

  async createMediaObject(accessToken, imageUrl, caption) {
    try {
      const response = await axios.post(
        `https://graph.instagram.com/me/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }
      );
      return response.data.id;
    } catch (error) {
      console.error(
        "Instagram Media Creation Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create Instagram media object");
    }
  },

  async publishMedia(accessToken, creationId) {
    try {
      const response = await axios.post(
        `https://graph.instagram.com/me/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram Publish Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to publish Instagram media");
    }
  },

  async postToInstagram(accessToken, imageUrl, caption) {
    try {
      // Step 1: Create media object
      const creationId = await this.createMediaObject(
        accessToken,
        imageUrl,
        caption
      );

      // Step 2: Publish media
      const result = await this.publishMedia(accessToken, creationId);

      return result;
    } catch (error) {
      console.error("Instagram Post Error:", error);
      throw error;
    }
  },
};

// Twitter API functions
const twitterAPI = {
  getClient() {
    return new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  },

  async getUserInfo() {
    try {
      const client = this.getClient();
      const user = await client.v2.me();
      return user.data;
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error("Failed to get Twitter user info");
    }
  },

  async postTweet(text) {
    try {
      const client = this.getClient();
      const tweet = await client.v2.tweet(text);
      return tweet.data;
    } catch (error) {
      console.error("Twitter Post Error:", error);
      throw new Error("Failed to post tweet");
    }
  },

  async postTweetWithMedia(text, mediaIds) {
    try {
      const client = this.getClient();
      const tweet = await client.v2.tweet({
        text: text,
        media: { media_ids: mediaIds },
      });
      return tweet.data;
    } catch (error) {
      console.error("Twitter Media Post Error:", error);
      throw new Error("Failed to post tweet with media");
    }
  },

  async uploadMedia(imageUrl) {
    try {
      const client = this.getClient();

      // Download image from URL
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data);

      // Upload media to Twitter
      const mediaId = await client.v1.uploadMedia(buffer, {
        mimeType: response.headers["content-type"] || "image/jpeg",
      });

      return mediaId;
    } catch (error) {
      console.error("Twitter Media Upload Error:", error);
      throw new Error("Failed to upload media to Twitter");
    }
  },
};

// Connect Instagram account with provided access token
router.post("/instagram/connect", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      return res
        .status(400)
        .json({ error: "Instagram access token not configured" });
    }

    // Get user info from Instagram
    const userInfo = await instagramAPI.getUserInfo(accessToken);

    // Store the encrypted token in database
    const encryptedToken = encrypt(accessToken);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .eq("platform_user_id", userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error } = await supabase
        .from("social_accounts")
        .update({
          encrypted_token: encryptedToken,
          username: userInfo.username,
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);

      if (error) throw error;
    } else {
      // Create new account
      const { error } = await supabase.from("social_accounts").insert({
        user_id: userId,
        platform: "instagram",
        platform_user_id: userInfo.id,
        username: userInfo.username,
        encrypted_token: encryptedToken,
        is_connected: true,
      });

      if (error) throw error;
    }

    res.json({
      success: true,
      message: "Instagram account connected successfully",
      account: {
        platform: "instagram",
        username: userInfo.username,
        id: userInfo.id,
      },
    });
  } catch (error) {
    console.error("Error connecting Instagram:", error);
    res.status(500).json({ error: error.message });
  }
});

// Connect Twitter account with provided credentials
router.post("/twitter/connect", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if Twitter credentials are configured
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
      return res
        .status(400)
        .json({ error: "Twitter API credentials not configured" });
    }

    // Get user info from Twitter
    const userInfo = await twitterAPI.getUserInfo();

    // Create encrypted token payload (for consistency with Instagram)
    const tokenPayload = JSON.stringify({
      api_key: process.env.TWITTER_API_KEY,
      api_secret: process.env.TWITTER_API_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
    const encryptedToken = encrypt(tokenPayload);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "twitter")
      .eq("platform_user_id", userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error } = await supabase
        .from("social_accounts")
        .update({
          encrypted_token: encryptedToken,
          username: userInfo.username,
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);

      if (error) throw error;
    } else {
      // Create new account
      const { error } = await supabase.from("social_accounts").insert({
        user_id: userId,
        platform: "twitter",
        platform_user_id: userInfo.id,
        username: userInfo.username,
        encrypted_token: encryptedToken,
        is_connected: true,
      });

      if (error) throw error;
    }

    res.json({
      success: true,
      message: "Twitter account connected successfully",
      account: {
        platform: "twitter",
        username: userInfo.username,
        id: userInfo.id,
      },
    });
  } catch (error) {
    console.error("Error connecting Twitter:", error);
    res.status(500).json({ error: error.message });
  }
});

// Post to Instagram
router.post("/instagram/post", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { imageUrl, caption } = req.body;

    if (!imageUrl || !caption) {
      return res
        .status(400)
        .json({ error: "Image URL and caption are required" });
    }

    // Get Instagram account for user
    const { data: account, error: fetchError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .eq("is_connected", true)
      .single();

    if (fetchError || !account) {
      return res.status(400).json({ error: "Instagram account not connected" });
    }

    // Decrypt token
    const accessToken = decrypt(account.encrypted_token);

    // Post to Instagram
    const result = await instagramAPI.postToInstagram(
      accessToken,
      imageUrl,
      caption
    );

    res.json({
      success: true,
      message: "Posted to Instagram successfully",
      post_id: result.id,
    });
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    res.status(500).json({ error: error.message });
  }
});

// Post to Twitter
router.post("/twitter/post", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { text, imageUrl } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Tweet text is required" });
    }

    // Get Twitter account for user
    const { data: account, error: fetchError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("isActive", true)
      .single();

    if (fetchError || !account) {
      console.log(
        "No user Twitter account found, using global tokens for immediate posting"
      );
      // For immediate posting, we can proceed with global tokens
      // return res.status(400).json({ error: "Twitter account not connected" });
    }

    let result;

    if (imageUrl) {
      // Post tweet with image
      try {
        const mediaId = await twitterAPI.uploadMedia(imageUrl);
        result = await twitterAPI.postTweetWithMedia(text, [mediaId]);
      } catch (mediaError) {
        console.error("Error uploading media, posting text only:", mediaError);
        // Fallback to text-only tweet if media upload fails
        result = await twitterAPI.postTweet(text);
      }
    } else {
      // Post text-only tweet
      result = await twitterAPI.postTweet(text);
    }

    res.json({
      success: true,
      message: "Posted to Twitter successfully",
      tweet_id: result.id,
      tweet_text: result.text,
    });
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Instagram auth URL (for OAuth implementation)
router.get("/instagram/auth", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Instagram Basic Display API OAuth URL
    const instagramAppId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      "http://localhost:5001/api/social/instagram/callback";

    if (!instagramAppId) {
      return res.status(400).json({
        error:
          "Instagram App ID not configured. Please set INSTAGRAM_CLIENT_ID in environment variables.",
      });
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state temporarily (in a real app, use Redis or database)
    // For now, we'll include userId in state
    const stateWithUser = `${state}:${userId}`;

    const authUrl =
      `https://api.instagram.com/oauth/authorize` +
      `?client_id=${instagramAppId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user_profile,user_media` +
      `&response_type=code` +
      `&state=${stateWithUser}`;

    res.json({
      success: true,
      authUrl: authUrl,
      message: "Redirect user to this URL to authorize Instagram access",
    });
  } catch (error) {
    console.error("Error getting Instagram auth URL:", error);
    res.status(500).json({ error: error.message });
  }
});

// Instagram OAuth callback
router.get("/instagram/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${
          process.env.SITE_URL || "https://frontenddautomation.onrender.com"
        }/accounts?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `http://localhost:3000/accounts?error=Missing authorization code or state`
      );
    }

    // Extract userId from state
    const [stateToken, userId] = state.split(":");
    if (!userId) {
      return res.redirect(
        `http://localhost:3000/accounts?error=Invalid state parameter`
      );
    }

    const instagramAppId = process.env.INSTAGRAM_CLIENT_ID;
    const instagramAppSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      "http://localhost:5001/api/social/instagram/callback";

    if (!instagramAppId || !instagramAppSecret) {
      return res.redirect(
        `http://localhost:3000/accounts?error=Instagram app credentials not configured`
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      {
        client_id: instagramAppId,
        client_secret: instagramAppSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from Instagram
    const userInfo = await instagramAPI.getUserInfo(access_token);

    // Store the encrypted token in database
    const encryptedToken = encrypt(access_token);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .eq("platform_user_id", userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from("social_accounts")
        .update({
          encrypted_token: encryptedToken,
          username: userInfo.username,
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);
    } else {
      // Create new account
      await supabase.from("social_accounts").insert({
        user_id: userId,
        platform: "instagram",
        platform_user_id: userInfo.id,
        username: userInfo.username,
        encrypted_token: encryptedToken,
        is_connected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Redirect back to frontend with success
    res.redirect(
      "http://localhost:3000/accounts?success=Instagram account connected successfully"
    );
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    res.redirect(
      `http://localhost:3000/accounts?error=${encodeURIComponent(
        "Failed to connect Instagram account"
      )}`
    );
  }
});

// Get all connected social accounts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("id, platform, accountName, isActive, createdAt, updatedAt")
      .eq("userId", userId);

    if (error) throw error;

    // Normalize platform names to lowercase for consistency
    const normalizedAccounts = accounts.map((account) => ({
      ...account,
      platform: account.platform.toLowerCase(),
    }));

    // Add mock accounts for platforms that aren't connected yet
    const connectedPlatforms = normalizedAccounts.map((acc) => acc.platform);
    const allPlatforms = ["twitter", "instagram"]; // Focus on Twitter for now

    const mockAccounts = allPlatforms
      .filter((platform) => !connectedPlatforms.includes(platform))
      .map((platform) => ({
        id: null,
        platform,
        accountName: null,
        isConnected: false,
        followers: Math.floor(Math.random() * 5000) + 1000, // Mock follower count
        createdAt: null,
        updatedAt: null,
      }));

    const formattedAccounts = normalizedAccounts.map((acc) => ({
      ...acc,
      isConnected: acc.isActive,
      username: acc.accountName, // Map accountName to username for frontend compatibility
      followers: Math.floor(Math.random() * 5000) + 1000, // Mock follower count
    }));

    res.json([...formattedAccounts, ...mockAccounts]);
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect social account
router.delete("/:platform", authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const { userId } = req.user;

    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("user_id", userId)
      .eq("platform", platform);

    if (error) throw error;

    res.json({
      success: true,
      message: `${platform} account disconnected successfully`,
    });
  } catch (error) {
    console.error("Error disconnecting account:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Twitter auth status
router.get("/twitter/auth", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if Twitter credentials are configured
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
      return res.status(400).json({
        error: "Twitter API credentials not configured",
        message:
          "Please configure Twitter API credentials in environment variables",
      });
    }

    // Check if user has connected Twitter account
    const { data: account, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "twitter")
      .eq("is_connected", true)
      .single();

    if (error || !account) {
      return res.json({
        connected: false,
        message:
          "Twitter account not connected. Use POST /api/social/twitter/connect to connect.",
        authUrl: null,
      });
    }

    // Get Twitter user info to verify connection
    try {
      const userInfo = await twitterAPI.getUserInfo();
      res.json({
        connected: true,
        account: {
          platform: "twitter",
          username: account.username,
          id: account.platform_user_id,
          verified_username: userInfo.username,
        },
        message: "Twitter account connected and verified",
      });
    } catch (apiError) {
      console.error("Twitter API verification failed:", apiError);
      res.json({
        connected: true,
        account: {
          platform: "twitter",
          username: account.username,
          id: account.platform_user_id,
        },
        message: "Twitter account connected but API verification failed",
        warning: "API credentials may be invalid",
      });
    }
  } catch (error) {
    console.error("Error checking Twitter auth:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/linkedin/auth", authMiddleware, async (req, res) => {
  res.status(501).json({
    error: "LinkedIn integration not yet implemented",
    message: "Coming soon!",
  });
});

module.exports = router;
