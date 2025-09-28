const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get all connected social accounts for the authenticated user
router.get("/accounts", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("isActive", true);

    if (error) {
      console.error("Error fetching social accounts:", error);
      return res.status(500).json({ error: "Failed to fetch social accounts" });
    }

    // Format accounts for response
    const formattedAccounts = accounts.map((account) => ({
      id: account.id,
      platform: account.platform.toLowerCase(),
      username: account.accountName,
      platformUserId: account.accountId,
      connectedAt: account.createdAt,
      isActive: account.isActive,
    }));

    res.json(formattedAccounts);
  } catch (error) {
    console.error("Error in /accounts endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
  // New Instagram credentials
  getAccessToken() {
    return (
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      "IGAASZBSOMqFQ5BZAFFBSUVlQXpvSjBpUlVOTWV1TzBod2dwVDFXajc3ZATJxamN4S1ZAXazNiZADlOTmh3cDNsbFo5SEd6cEtsdVpWZAXpmLUpmckNGWjdENzAzZAE5YZAVUtejdOU0NqM09idWcwS2thMFgzS19rREJCUS1pekxWTFowWQZDZD"
    );
  },

  getAppSecret() {
    return (
      process.env.INSTAGRAM_APP_SECRET || "62f6b8386809cbbef5dee0997bffb25c"
    );
  },

  async getUserInfo(accessToken = null) {
    try {
      const token = accessToken || this.getAccessToken();
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${token}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to get Instagram user info: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  },

  async getAccountInfo(accessToken = null) {
    try {
      const token = accessToken || this.getAccessToken();
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${token}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram Account Info Error:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to get Instagram account info: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  },

  async getMedia(accessToken = null, limit = 10) {
    try {
      const token = accessToken || this.getAccessToken();
      const response = await axios.get(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${token}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram Media Error:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to get Instagram media: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  },

  async createMediaObject(accessToken, imageUrl, caption) {
    try {
      const token = accessToken || this.getAccessToken();
      const response = await axios.post(
        `https://graph.instagram.com/me/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: token,
        }
      );
      return response.data.id;
    } catch (error) {
      console.error(
        "Instagram Media Creation Error:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to create Instagram media object: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  },

  async publishMedia(accessToken, creationId) {
    try {
      const token = accessToken || this.getAccessToken();
      const response = await axios.post(
        `https://graph.instagram.com/me/media_publish`,
        {
          creation_id: creationId,
          access_token: token,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Instagram Publish Error:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to publish Instagram media: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  },

  async postToInstagram(accessToken, imageUrl, caption) {
    try {
      const token = accessToken || this.getAccessToken();

      // Step 1: Create media object
      const creationId = await this.createMediaObject(token, imageUrl, caption);
      console.log("✅ Media object created with ID:", creationId);

      // Step 2: Publish media
      const result = await this.publishMedia(token, creationId);
      console.log("✅ Media published successfully:", result);

      return result;
    } catch (error) {
      console.error("Instagram Post Error:", error);
      throw error;
    }
  },

  async testConnection(accessToken = null) {
    try {
      const token = accessToken || this.getAccessToken();
      console.log("🔄 Testing Instagram API connection...");

      // Test basic user info endpoint
      const userInfo = await this.getUserInfo(token);
      console.log("✅ Instagram API connection successful");

      return {
        success: true,
        user: userInfo,
        message: "Instagram API connection successful",
      };
    } catch (error) {
      console.error("❌ Instagram API connection failed:", error.message);
      return {
        success: false,
        error: error.message,
        message: "Instagram API connection failed",
      };
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

      // Handle specific Twitter API errors
      if (error.code === 429) {
        throw new Error(
          "Twitter rate limit exceeded. Please wait 15 minutes before posting again."
        );
      } else if (error.code === 401) {
        throw new Error(
          "Twitter authentication failed. Please check API credentials."
        );
      } else if (error.code === 403) {
        throw new Error(
          "Twitter posting forbidden. Check if account has posting permissions."
        );
      } else if (error.data && error.data.detail) {
        throw new Error(`Twitter API error: ${error.data.detail}`);
      } else {
        throw new Error(`Failed to post tweet: ${error.message}`);
      }
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

      // Handle specific Twitter API errors
      if (error.code === 429) {
        throw new Error(
          "Twitter rate limit exceeded. Please wait 15 minutes before posting again."
        );
      } else if (error.code === 401) {
        throw new Error(
          "Twitter authentication failed. Please check API credentials."
        );
      } else if (error.code === 403) {
        throw new Error(
          "Twitter posting forbidden. Check if account has posting permissions."
        );
      } else if (error.data && error.data.detail) {
        throw new Error(`Twitter API error: ${error.data.detail}`);
      } else {
        throw new Error(`Failed to post tweet with media: ${error.message}`);
      }
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

// Public test endpoint for Instagram API (no auth required)
router.get("/instagram/test-public", async (req, res) => {
  try {
    console.log("🔄 Public Instagram API test...");

    // Test the connection
    const connectionTest = await instagramAPI.testConnection();

    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        error: connectionTest.error,
        message: "Instagram API connection failed",
      });
    }

    // Get additional account info
    try {
      const accountInfo = await instagramAPI.getAccountInfo();
      const media = await instagramAPI.getMedia(null, 3); // Get latest 3 posts

      res.json({
        success: true,
        message: "Instagram API is working correctly",
        connection: connectionTest,
        account: accountInfo,
        recentMedia: media,
        credentials: {
          hasAccessToken: !!instagramAPI.getAccessToken(),
          hasAppSecret: !!instagramAPI.getAppSecret(),
          tokenLength: instagramAPI.getAccessToken()
            ? instagramAPI.getAccessToken().length
            : 0,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (detailError) {
      // Still return success if basic connection works
      res.json({
        success: true,
        message:
          "Instagram API basic connection works, but couldn't fetch detailed info",
        connection: connectionTest,
        detailError: detailError.message,
        credentials: {
          hasAccessToken: !!instagramAPI.getAccessToken(),
          hasAppSecret: !!instagramAPI.getAppSecret(),
          tokenLength: instagramAPI.getAccessToken()
            ? instagramAPI.getAccessToken().length
            : 0,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Public Instagram test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to test Instagram API",
    });
  }
});

// Test Instagram API connection and get account info
router.get("/instagram/test", authMiddleware, async (req, res) => {
  try {
    console.log("🔄 Testing Instagram API...");

    // Test the connection
    const connectionTest = await instagramAPI.testConnection();

    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        error: connectionTest.error,
        message: "Instagram API connection failed",
      });
    }

    // Get additional account info
    try {
      const accountInfo = await instagramAPI.getAccountInfo();
      const media = await instagramAPI.getMedia(null, 5); // Get latest 5 posts

      res.json({
        success: true,
        message: "Instagram API is working correctly",
        connection: connectionTest,
        account: accountInfo,
        recentMedia: media,
        credentials: {
          hasAccessToken: !!instagramAPI.getAccessToken(),
          hasAppSecret: !!instagramAPI.getAppSecret(),
          tokenLength: instagramAPI.getAccessToken()
            ? instagramAPI.getAccessToken().length
            : 0,
        },
      });
    } catch (detailError) {
      // Still return success if basic connection works
      res.json({
        success: true,
        message:
          "Instagram API basic connection works, but couldn't fetch detailed info",
        connection: connectionTest,
        detailError: detailError.message,
        credentials: {
          hasAccessToken: !!instagramAPI.getAccessToken(),
          hasAppSecret: !!instagramAPI.getAppSecret(),
          tokenLength: instagramAPI.getAccessToken()
            ? instagramAPI.getAccessToken().length
            : 0,
        },
      });
    }
  } catch (error) {
    console.error("Instagram test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to test Instagram API",
    });
  }
});

// Get Instagram account details
router.get("/instagram/account", authMiddleware, async (req, res) => {
  try {
    const accountInfo = await instagramAPI.getAccountInfo();
    const media = await instagramAPI.getMedia();

    res.json({
      success: true,
      account: accountInfo,
      media: media,
      message: "Instagram account information retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting Instagram account info:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get Instagram account information",
    });
  }
});

// Test Instagram post functionality (without actually posting)
router.post("/instagram/test-post", authMiddleware, async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;

    if (!imageUrl || !caption) {
      return res.status(400).json({
        success: false,
        error: "Image URL and caption are required",
        message: "Please provide both imageUrl and caption",
      });
    }

    // Validate image URL is accessible
    try {
      const imageResponse = await axios.head(imageUrl);
      const contentType = imageResponse.headers["content-type"];

      if (!contentType || !contentType.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          error: "Invalid image URL - not an image",
          message: `URL does not point to an image. Content-Type: ${contentType}`,
        });
      }
    } catch (imageError) {
      return res.status(400).json({
        success: false,
        error: "Image URL not accessible",
        message: `Could not access image at ${imageUrl}. Error: ${imageError.message}`,
      });
    }

    // Test connection first
    const connectionTest = await instagramAPI.testConnection();

    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        error: "Instagram API connection failed",
        message: connectionTest.error,
      });
    }

    res.json({
      success: true,
      message: "Instagram post test successful - ready to post",
      validation: {
        imageUrl: "✅ Valid and accessible",
        caption: `✅ Caption ready (${caption.length} characters)`,
        apiConnection: "✅ Instagram API connected",
        account: connectionTest.user,
      },
      note: "Use POST /instagram/post to actually publish this content",
    });
  } catch (error) {
    console.error("Instagram post test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Instagram post test failed",
    });
  }
});

// Connect Instagram account with provided access token
router.post("/instagram/connect", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const accessToken = instagramAPI.getAccessToken();

    if (!accessToken) {
      return res
        .status(400)
        .json({ error: "Instagram access token not configured" });
    }

    console.log("🔄 Connecting Instagram with new credentials...");

    // Test the connection first
    const connectionTest = await instagramAPI.testConnection(accessToken);

    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        error: connectionTest.error,
        message: "Failed to connect to Instagram API",
      });
    }

    // Get user info from Instagram
    const userInfo = connectionTest.user;

    // Store the encrypted token in database
    const encryptedToken = encrypt(accessToken);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "INSTAGRAM")
      .eq("accountId", userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error } = await supabase
        .from("social_accounts")
        .update({
          accessToken: encryptedToken,
          accountName: userInfo.username,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);

      if (error) throw error;
      console.log("✅ Updated existing Instagram account");
    } else {
      // Create new account
      const { error } = await supabase.from("social_accounts").insert({
        userId: userId,
        platform: "INSTAGRAM",
        accountId: userInfo.id,
        accountName: userInfo.username,
        accessToken: encryptedToken,
        isActive: true,
      });

      if (error) throw error;
      console.log("✅ Created new Instagram account connection");
    }

    res.json({
      success: true,
      message: "Instagram account connected successfully",
      account: {
        platform: "instagram",
        username: userInfo.username,
        id: userInfo.id,
        accountType: userInfo.account_type,
        mediaCount: userInfo.media_count,
      },
    });
  } catch (error) {
    console.error("Error connecting Instagram:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to connect Instagram account",
    });
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
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("accountId", userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error } = await supabase
        .from("social_accounts")
        .update({
          accessToken: encryptedToken,
          accountName: userInfo.username,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);

      if (error) throw error;
    } else {
      // Create new account
      const { error } = await supabase.from("social_accounts").insert({
        userId: userId,
        platform: "TWITTER",
        accountId: userInfo.id,
        accountName: userInfo.username,
        accessToken: encryptedToken,
        isActive: true,
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

    console.log("🔄 Posting to Instagram...", {
      userId,
      imageUrl: imageUrl.substring(0, 50) + "...",
      captionLength: caption.length,
    });

    // First try to use user's connected account
    let accessToken = instagramAPI.getAccessToken(); // fallback to global token

    try {
      // Get Instagram account for user
      const { data: account, error: fetchError } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("userId", userId)
        .eq("platform", "INSTAGRAM")
        .eq("isActive", true)
        .single();

      if (!fetchError && account) {
        // Use user's connected account token
        accessToken = decrypt(account.accessToken);
        console.log("✅ Using user-specific Instagram token");
      } else {
        console.log(
          "⚠️  Using global Instagram token (user account not found)"
        );
      }
    } catch (dbError) {
      console.log(
        "⚠️  Database error, using global Instagram token:",
        dbError.message
      );
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "No Instagram access token available",
        message:
          "Please connect your Instagram account or configure global credentials",
      });
    }

    // Validate image URL
    try {
      const imageResponse = await axios.head(imageUrl);
      const contentType = imageResponse.headers["content-type"];

      if (!contentType || !contentType.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          error: "Invalid image URL - not an image",
          message: `URL does not point to an image. Content-Type: ${contentType}`,
        });
      }
    } catch (imageError) {
      return res.status(400).json({
        success: false,
        error: "Image URL not accessible",
        message: `Could not access image at ${imageUrl}`,
      });
    }

    // Post to Instagram
    const result = await instagramAPI.postToInstagram(
      accessToken,
      imageUrl,
      caption
    );

    console.log("✅ Instagram post successful:", result);

    res.json({
      success: true,
      message: "Posted to Instagram successfully",
      post_id: result.id,
      result: result,
    });
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to post to Instagram",
    });
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

// Connect Twitter account using global credentials
router.post("/connect-global-twitter", authMiddleware, async (req, res) => {
  try {
    console.log(
      "🔗 Connecting Twitter with global credentials for user:",
      req.user.userId
    );

    const { userId } = req.user;

    // Check if Twitter account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .single();

    if (existingAccount) {
      return res.json({
        connected: true,
        account: {
          platform: "twitter",
          username: existingAccount.accountName || "Global Twitter Account",
          id: existingAccount.accountId || "global",
        },
        message: "Twitter account already connected",
      });
    }

    // Create Twitter connection using global credentials
    const twitterCredentials = {
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };

    // Encrypt the credentials
    const encryptedAccessToken = encrypt(twitterCredentials.access_token);

    // Verify credentials work by testing API
    let username = "GlobalTwitterBot";
    try {
      const twitterClient = new TwitterApi({
        appKey: twitterCredentials.consumer_key,
        appSecret: twitterCredentials.consumer_secret,
        accessToken: twitterCredentials.access_token,
        accessSecret: twitterCredentials.access_token_secret,
      });

      const userInfo = await twitterClient.v2.me();
      username = userInfo.data.username;
      console.log("✅ Twitter API verification successful:", userInfo.data);
    } catch (apiError) {
      console.warn(
        "⚠️  Twitter API verification failed, but proceeding with connection:",
        apiError.message
      );
    }

    // Insert the social account
    const { data: account, error } = await supabase
      .from("social_accounts")
      .insert({
        userId: userId,
        platform: "TWITTER",
        accountId: "global-twitter-account",
        accountName: username,
        accessToken: encryptedAccessToken,
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating Twitter social account:", error);
      return res.status(500).json({
        error: "Failed to connect Twitter account",
        details: error.message,
      });
    }

    console.log("✅ Twitter account connected successfully:", account);

    res.json({
      connected: true,
      account: {
        platform: "twitter",
        username: username,
        id: account.accountId,
      },
      message: "Twitter account connected using global credentials",
    });
  } catch (error) {
    console.error("Error connecting global Twitter account:", error);
    res.status(500).json({
      error: "Failed to connect Twitter account",
      message: error.message,
    });
  }
});

// Auto-connect both Twitter and Instagram for user
router.post("/connect-all", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const results = { twitter: null, instagram: null };

    // Connect Twitter
    try {
      const twitterResponse = await fetch(
        `http://localhost:5001/api/social/twitter/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
        }
      );

      const twitterResult = await twitterResponse.json();
      results.twitter = twitterResult;
    } catch (twitterError) {
      results.twitter = { error: twitterError.message };
    }

    // Connect Instagram
    try {
      const instagramResponse = await fetch(
        `http://localhost:5001/api/social/instagram/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
        }
      );

      const instagramResult = await instagramResponse.json();
      results.instagram = instagramResult;
    } catch (instagramError) {
      results.instagram = { error: instagramError.message };
    }

    const successCount = [results.twitter, results.instagram].filter(
      (r) => r?.success
    ).length;

    res.json({
      success: successCount > 0,
      message: `Connected ${successCount} out of 2 platforms`,
      results: results,
    });
  } catch (error) {
    console.error("Error connecting all accounts:", error);
    res.status(500).json({
      error: "Failed to connect accounts",
      message: error.message,
    });
  }
});

// Quick setup endpoint - automatically connects both platforms for demo/testing
router.post("/quick-setup", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("🚀 Quick setup for user:", userId);

    const results = [];

    // Auto-connect Instagram with global credentials
    try {
      const { data: existingInstagram } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("userId", userId)
        .eq("platform", "INSTAGRAM")
        .single();

      if (!existingInstagram) {
        // Get Instagram account info
        const instagramInfo = await instagramAPI.getAccountInfo();

        // Create Instagram account
        const { data: instagramAccount, error: instagramError } = await supabase
          .from("social_accounts")
          .insert({
            userId: userId,
            platform: "INSTAGRAM",
            accountId: instagramInfo.id,
            accountName: instagramInfo.username,
            accessToken: encrypt(instagramAPI.getAccessToken()),
            isActive: true,
          })
          .select()
          .single();

        if (instagramError) {
          results.push({
            platform: "instagram",
            success: false,
            error: instagramError.message,
          });
        } else {
          results.push({
            platform: "instagram",
            success: true,
            account: instagramAccount,
          });
        }
      } else {
        results.push({
          platform: "instagram",
          success: true,
          message: "Already connected",
        });
      }
    } catch (error) {
      results.push({
        platform: "instagram",
        success: false,
        error: error.message,
      });
    }

    // Auto-connect Twitter with global credentials
    try {
      const { data: existingTwitter } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("userId", userId)
        .eq("platform", "TWITTER")
        .single();

      if (!existingTwitter) {
        // Create Twitter account
        const { data: twitterAccount, error: twitterError } = await supabase
          .from("social_accounts")
          .insert({
            userId: userId,
            platform: "TWITTER",
            accountId: "1902337434228346880",
            accountName: "Harii_2005",
            accessToken: encrypt(process.env.TWITTER_ACCESS_TOKEN),
            isActive: true,
          })
          .select()
          .single();

        if (twitterError) {
          results.push({
            platform: "twitter",
            success: false,
            error: twitterError.message,
          });
        } else {
          results.push({
            platform: "twitter",
            success: true,
            account: twitterAccount,
          });
        }
      } else {
        results.push({
          platform: "twitter",
          success: true,
          message: "Already connected",
        });
      }
    } catch (error) {
      results.push({
        platform: "twitter",
        success: false,
        error: error.message,
      });
    }

    const successCount = results.filter((r) => r.success).length;

    res.json({
      success: successCount > 0,
      message: `Quick setup complete: ${successCount}/2 platforms connected`,
      results: results,
    });
  } catch (error) {
    console.error("Error in quick setup:", error);
    res.status(500).json({
      error: "Quick setup failed",
      message: error.message,
    });
  }
});

// Test posting to both platforms (no auth required for testing)
router.post("/test-posting", async (req, res) => {
  try {
    const {
      content,
      imageUrl,
      platforms = ["twitter", "instagram"],
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    console.log("🧪 Testing posting to platforms:", platforms);
    console.log("Content:", content);
    console.log("Image URL:", imageUrl);

    const results = [];

    // Test each platform
    for (const platform of platforms) {
      if (platform.toLowerCase() === "twitter") {
        try {
          const result = await twitterAPI.postTweet(content);
          results.push({
            platform: "twitter",
            success: true,
            result: result,
            message: "Successfully posted to Twitter",
          });
          console.log("✅ Twitter post successful:", result);
        } catch (error) {
          console.error("❌ Twitter post failed:", error.message);
          results.push({
            platform: "twitter",
            success: false,
            error: error.message,
            message: "Failed to post to Twitter",
          });
        }
      }

      if (platform.toLowerCase() === "instagram") {
        if (!imageUrl) {
          results.push({
            platform: "instagram",
            success: false,
            error: "Image URL is required for Instagram",
            message: "Instagram requires an image URL",
          });
          continue;
        }

        try {
          const result = await instagramAPI.postToInstagram(
            instagramAPI.getAccessToken(),
            imageUrl,
            content
          );
          results.push({
            platform: "instagram",
            success: true,
            result: result,
            message: "Successfully posted to Instagram",
          });
          console.log("✅ Instagram post successful:", result);
        } catch (error) {
          console.error("❌ Instagram post failed:", error.message);
          results.push({
            platform: "instagram",
            success: false,
            error: error.message,
            message: "Failed to post to Instagram",
          });
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    res.json({
      success: successCount > 0,
      message: `Posted to ${successCount} out of ${totalCount} platforms`,
      results: results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
      },
    });
  } catch (error) {
    console.error("Test posting error:", error);
    res.status(500).json({
      error: error.message,
      message: "Test posting failed",
    });
  }
});

// Get connection status for platforms (no auth required - for frontend checks)
router.get("/status", async (req, res) => {
  try {
    const status = {
      instagram: { connected: false, account: null, error: null },
      twitter: { connected: false, account: null, error: null },
    };

    // Check Instagram global connection
    try {
      const instagramTest = await instagramAPI.testConnection();
      if (instagramTest.success) {
        status.instagram.connected = true;
        status.instagram.account = instagramTest.user;
      } else {
        status.instagram.error = instagramTest.error;
      }
    } catch (error) {
      status.instagram.error = error.message;
    }

    // Check Twitter global connection
    try {
      const twitterUser = await twitterAPI.getUserInfo();
      status.twitter.connected = true;
      status.twitter.account = twitterUser;
    } catch (error) {
      status.twitter.error = error.message;
    }

    res.json({
      success: true,
      message: "Platform connection status retrieved",
      status: status,
    });
  } catch (error) {
    console.error("Error checking platform status:", error);
    res.status(500).json({
      error: "Failed to check platform status",
      message: error.message,
    });
  }
});

module.exports = router;
