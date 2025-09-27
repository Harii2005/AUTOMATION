const cron = require("node-cron");
const { supabase } = require("../utils/database");
const { TwitterApi } = require("twitter-api-v2");
const crypto = require("crypto");

// Encryption/Decryption utility functions (same as in social.js)
const algorithm = "aes-256-cbc";
const secretKey =
  process.env.ENCRYPTION_KEY || "default-32-char-secret-key-here!!";

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

class ScheduledPostingService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    console.log("🚀 Starting Scheduled Posting Service");

    // Check for scheduled posts every minute
    cron.schedule("* * * * *", async () => {
      if (this.isRunning) {
        console.log("⏳ Previous check still running, skipping...");
        return;
      }

      this.isRunning = true;
      await this.checkAndProcessScheduledPosts();
      this.isRunning = false;
    });

    console.log("✅ Scheduled Posting Service started");
  }

  async checkAndProcessScheduledPosts() {
    try {
      const now = new Date();
      console.log(`🔍 Checking for scheduled posts at ${now.toISOString()}`);

      // Get all pending posts that are due to be posted
      const { data: scheduledPosts, error } = await supabase
        .from("scheduled_posts")
        .select(
          `
          *,
          social_accounts (
            accessToken,
            refreshToken,
            platform
          )
        `
        )
        .eq("status", "PENDING")
        .lte("scheduledTime", now.toISOString())
        .order("scheduledTime", { ascending: true });

      if (error) {
        console.error("❌ Error fetching scheduled posts:", error);
        return;
      }

      if (!scheduledPosts || scheduledPosts.length === 0) {
        console.log("📭 No scheduled posts found");
        return;
      }

      console.log(`📝 Found ${scheduledPosts.length} posts to process`);

      // Process each scheduled post
      for (const post of scheduledPosts) {
        await this.processScheduledPost(post);
      }
    } catch (error) {
      console.error("❌ Error in checkAndProcessScheduledPosts:", error);
    }
  }

  async processScheduledPost(post) {
    try {
      console.log(
        `📤 Processing post ${post.id} for platform ${post.platform}`
      );

      // Update status to indicate we're processing (comment out since PROCESSING isn't in the current schema)
      // await this.updatePostStatus(post.id, 'PROCESSING');      let result = null;
      let success = false;

      // Route to appropriate platform handler
      switch (post.platform.toUpperCase()) {
        case "TWITTER":
          result = await this.postToTwitter(post);
          success = result.success;
          break;
        case "LINKEDIN":
          result = await this.postToLinkedIn(post);
          success = result.success;
          break;
        case "INSTAGRAM":
          result = await this.postToInstagram(post);
          success = result.success;
          break;
        default:
          console.error(`❌ Unsupported platform: ${post.platform}`);
          await this.updatePostStatus(
            post.id,
            "FAILED",
            `Unsupported platform: ${post.platform}`
          );
          return;
      }

      // Update post status based on result
      if (success) {
        await this.updatePostStatus(
          post.id,
          "POSTED",
          null,
          result.platformPostId
        );
        console.log(`✅ Successfully posted to ${post.platform}: ${post.id}`);
      } else {
        const errorMessage = result.error || "Unknown error occurred";
        await this.handlePostFailure(post, errorMessage);
      }
    } catch (error) {
      console.error(`❌ Error processing post ${post.id}:`, error);
      await this.handlePostFailure(post, error.message);
    }
  }

  async postToTwitter(post) {
    try {
      const socialAccount = post.social_accounts;
      if (!socialAccount || !socialAccount.accessToken) {
        return { success: false, error: "No Twitter access token found" };
      }

      // Try to decrypt the access token and refresh token, fallback to unencrypted
      let accessToken, refreshToken;
      try {
        if (
          socialAccount.accessToken &&
          socialAccount.accessToken.includes(":")
        ) {
          accessToken = decrypt(socialAccount.accessToken);
          refreshToken = socialAccount.refreshToken
            ? decrypt(socialAccount.refreshToken)
            : null;
        } else {
          // Treat as unencrypted
          accessToken = socialAccount.accessToken;
          refreshToken = socialAccount.refreshToken;
        }
      } catch (decryptError) {
        console.error("Error decrypting tokens:", decryptError);
        // Fallback to treating as unencrypted for compatibility
        accessToken = socialAccount.accessToken;
        refreshToken = socialAccount.refreshToken;
      }

      // For now, always use global tokens to avoid authentication issues
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      const tokenSource = "global";
      console.log(`🔑 Using global app tokens for post ${post.id}`);

      let result;

      if (post.mediaUrl) {
        // Post with media
        const axios = require("axios");

        try {
          // Download image from URL
          const response = await axios.get(post.mediaUrl, {
            responseType: "arraybuffer",
            timeout: 30000, // 30 second timeout
          });
          const buffer = Buffer.from(response.data);

          // Upload media to Twitter
          const mediaId = await client.v1.uploadMedia(buffer, {
            mimeType: response.headers["content-type"] || "image/jpeg",
          });

          // Post tweet with media
          result = await client.v2.tweet({
            text: post.content,
            media: { media_ids: [mediaId] },
          });
        } catch (mediaError) {
          console.error("Media processing error:", mediaError);
          // If media fails, try posting without media
          console.log("Attempting to post without media due to media error");
          result = await client.v2.tweet(post.content);
        }
      } else {
        // Post text-only tweet
        result = await client.v2.tweet(post.content);
      }

      return {
        success: true,
        platformPostId: result.data.id,
        data: result.data,
        tokenSource: tokenSource,
        postType: post.postType || "STANDARD",
      };
    } catch (error) {
      console.error("Twitter posting error:", error);

      // Handle specific Twitter API errors
      let errorMessage = "Failed to post to Twitter";
      if (error.code === 403) {
        errorMessage =
          "Twitter API access forbidden - check credentials or permissions";
      } else if (error.code === 401) {
        errorMessage = "Twitter API unauthorized - invalid or expired tokens";
      } else if (error.code === 429) {
        errorMessage = "Twitter API rate limit exceeded - will retry later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async postToLinkedIn(post) {
    // Placeholder for LinkedIn implementation
    console.log("📌 LinkedIn posting not yet implemented");
    return {
      success: false,
      error: "LinkedIn posting not yet implemented",
    };
  }

  async postToInstagram(post) {
    // Placeholder for Instagram implementation
    console.log("📌 Instagram posting not yet implemented");
    return {
      success: false,
      error: "Instagram posting not yet implemented",
    };
  }

  async updatePostStatus(postId, status, error = null, platformPostId = null) {
    try {
      const updateData = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (error) {
        updateData.error = error;
      }

      if (platformPostId) {
        updateData.platformPostId = platformPostId;
      }

      const { error: updateError } = await supabase
        .from("scheduled_posts")
        .update(updateData)
        .eq("id", postId);

      if (updateError) {
        console.error(`❌ Error updating post ${postId} status:`, updateError);
      }
    } catch (error) {
      console.error(`❌ Error updating post ${postId} status:`, error);
    }
  }

  async handlePostFailure(post, errorMessage) {
    const retryCount = post.retryCount + 1;
    const maxRetries = 3; // Fixed to 3 since maxRetries field may not exist

    if (retryCount < maxRetries) {
      // Calculate retry delay (exponential backoff)
      const baseDelay = 5 * 60 * 1000; // 5 minutes
      const retryDelay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff
      const retryTime = new Date(Date.now() + retryDelay);

      await supabase
        .from("scheduled_posts")
        .update({
          retryCount,
          error: errorMessage,
          scheduledTime: retryTime.toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", post.id);

      console.log(
        `🔄 Scheduling retry ${retryCount}/${maxRetries} for post ${
          post.id
        } at ${retryTime.toISOString()} (delay: ${Math.round(
          retryDelay / 1000 / 60
        )} minutes)`
      );
    } else {
      // Max retries reached, mark as failed
      await this.updatePostStatus(
        post.id,
        "FAILED",
        `Max retries reached: ${errorMessage}`
      );
      console.log(`❌ Post ${post.id} failed after ${maxRetries} retries`);
    }
  }

  stop() {
    console.log("🛑 Stopping Scheduled Posting Service");
    // Note: node-cron doesn't provide a direct way to stop individual tasks
    // In a production environment, you might want to use a different approach
    // or store task references to destroy them
  }
}

module.exports = ScheduledPostingService;
