const express = require("express");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Schedule a new post with advanced options
router.post("/schedule", authMiddleware, async (req, res) => {
  try {
    console.log("📝 Schedule post request received:");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log(
      "User from auth middleware:",
      JSON.stringify(req.user, null, 2)
    );

    const {
      content,
      mediaUrl,
      mediaType,
      scheduledAt,
      platforms,
      postOptions = {}, // New: Advanced posting options
    } = req.body;
    const { userId } = req.user;

    // Extract advanced options
    const {
      useUserTokens = true, // Use user-specific tokens by default
      fallbackToGlobal = true, // Fallback to global tokens if user tokens fail
      retryOnFailure = true, // Enable automatic retry
      maxRetries = 3, // Maximum retry attempts
      enableEncryption = true, // Encrypt sensitive data
      postType = "standard", // 'standard', 'thread', 'reply'
    } = postOptions;

    // Validation
    if (!content || !scheduledAt) {
      return res.status(400).json({
        error: "Content and scheduled time are required",
      });
    }

    // Validate media if provided
    if (mediaUrl && !mediaType) {
      return res.status(400).json({
        error: "Media type is required when media URL is provided",
      });
    }

    // Validate media type
    if (
      mediaType &&
      !["IMAGE", "VIDEO", "GIF"].includes(mediaType.toUpperCase())
    ) {
      return res.status(400).json({
        error: "Invalid media type. Supported types: IMAGE, VIDEO, GIF",
      });
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        error: "Scheduled time must be in the future",
      });
    }

    // If no platforms specified, default to all connected platforms
    let targetPlatforms = platforms;
    if (!targetPlatforms || targetPlatforms.length === 0) {
      // Get all connected social accounts for the user
      const { data: socialAccounts, error: accountsError } = await supabase
        .from("social_accounts")
        .select("platform")
        .eq("userId", userId) // camelCase for Supabase
        .eq("isActive", true); // camelCase for Supabase

      if (accountsError) {
        console.error("Error fetching social accounts:", accountsError);
        return res
          .status(500)
          .json({ error: "Failed to fetch social accounts" });
      }

      targetPlatforms = socialAccounts.map((account) =>
        account.platform.toLowerCase()
      );
    }

    // Create scheduled posts for each platform
    const scheduledPosts = [];

    console.log(
      `📋 Processing ${targetPlatforms.length} target platform(s):`,
      targetPlatforms
    );

    for (const platform of targetPlatforms) {
      console.log(`🔍 Looking for ${platform} account for user ${userId}`);

      // Get the social account for this platform
      const { data: socialAccount, error: socialError } = await supabase
        .from("social_accounts")
        .select("id")
        .eq("userId", userId) // camelCase for Supabase
        .eq("platform", platform.toUpperCase()) // uppercase as per schema
        .eq("isActive", true) // camelCase for Supabase
        .single();

      console.log(`📊 Social account query result for ${platform}:`, {
        data: socialAccount,
        error: socialError,
      });

      if (socialError || !socialAccount) {
        console.warn(
          `❌ No connected ${platform} account found for user ${userId}`
        );
        continue;
      }

      console.log(`✅ Found ${platform} account:`, socialAccount.id);

      // Create scheduled post with only existing columns
      const { data: scheduledPost, error: postError } = await supabase
        .from("scheduled_posts")
        .insert({
          userId: userId,
          socialAccountId: socialAccount.id,
          content: content,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType ? mediaType.toUpperCase() : null,
          scheduledTime: scheduledDate.toISOString(),
          status: "PENDING",
          platform: platform.toUpperCase(),
        })
        .select()
        .single();

      if (postError) {
        console.error(
          `Error creating scheduled post for ${platform}:`,
          postError
        );
        continue;
      }

      scheduledPosts.push(scheduledPost);
    }

    if (scheduledPosts.length === 0) {
      return res.status(400).json({
        error: "No connected social accounts found for the specified platforms",
      });
    }

    res.status(201).json({
      success: true,
      message: `Post scheduled for ${scheduledPosts.length} platform(s)`,
      posts: scheduledPosts,
    });
  } catch (error) {
    console.error("Error scheduling post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get scheduled posts for calendar view
router.get("/scheduled", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { start, end, platform } = req.query;

    let query = supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts(platform, accountName)
      `
      )
      .eq("userId", userId); // camelCase for Supabase

    // Add filters if provided
    if (start) {
      query = query.gte("scheduledTime", start); // camelCase for Supabase
    }
    if (end) {
      query = query.lte("scheduledTime", end); // camelCase for Supabase
    }
    if (platform) {
      query = query.eq("platform", platform.toUpperCase()); // uppercase as per schema
    }

    const { data: posts, error } = await query.order("scheduledTime", {
      ascending: true,
    }); // camelCase for Supabase

    if (error) {
      console.error("Error fetching scheduled posts:", error);
      return res.status(500).json({ error: "Failed to fetch scheduled posts" });
    }

    // Transform data for frontend compatibility
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrl: post.media_url,
      mediaType: post.media_type,
      scheduledAt: post.scheduled_time,
      status: post.status,
      platform: post.platform,
      platforms: [post.platform], // For calendar compatibility
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    }));

    res.json({
      success: true,
      data: transformedPosts,
    });
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get posts for calendar view (alias for scheduled)
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { start, end, platform } = req.query;

    let query = supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts(platform, accountName)
      `
      )
      .eq("userId", userId);

    // Add filters if provided
    if (start) {
      query = query.gte("scheduledTime", start);
    }
    if (end) {
      query = query.lte("scheduledTime", end);
    }
    if (platform) {
      query = query.eq("platform", platform.toUpperCase());
    }

    const { data: posts, error } = await query.order("scheduledTime", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching calendar posts:", error);
      return res.status(500).json({ error: "Failed to fetch calendar posts" });
    }

    // Transform data for frontend compatibility
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      scheduledAt: post.scheduledTime,
      status: post.status.toLowerCase(),
      platform: post.platform.toLowerCase(),
      socialAccount: post.social_accounts,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      platforms: [post.platform], // For calendar compatibility
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error("Error in calendar endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific scheduled post
router.get("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts(platform, username)
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    // Transform data for frontend compatibility
    const transformedPost = {
      id: post.id,
      content: post.content,
      mediaUrl: post.media_url,
      mediaType: post.media_type,
      scheduledAt: post.scheduled_time,
      status: post.status,
      platform: post.platform,
      platforms: [post.platform],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };

    res.json({
      success: true,
      data: transformedPost,
    });
  } catch (error) {
    console.error("Error fetching scheduled post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a scheduled post
router.put("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { content, mediaUrl, mediaType, scheduledAt } = req.body;

    // Check if post exists and belongs to user
    const { data: existingPost, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    // Validate scheduled time if provided
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({
          error: "Scheduled time must be in the future",
        });
      }
    }

    // Update the post
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (mediaUrl !== undefined) updateData.media_url = mediaUrl;
    if (mediaType !== undefined) updateData.media_type = mediaType;
    if (scheduledAt !== undefined)
      updateData.scheduled_time = new Date(scheduledAt).toISOString();
    updateData.updated_at = new Date().toISOString();

    const { data: updatedPost, error: updateError } = await supabase
      .from("scheduled_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating scheduled post:", updateError);
      return res.status(500).json({ error: "Failed to update scheduled post" });
    }

    res.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a scheduled post
router.delete("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Check if post exists and belongs to user
    const { data: existingPost, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from("scheduled_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting scheduled post:", deleteError);
      return res.status(500).json({ error: "Failed to delete scheduled post" });
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Post immediately to social media
router.post("/post-now", authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl, platforms = ["twitter"] } = req.body;
    const { userId } = req.user;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const results = [];

    // Post to each platform
    for (const platform of platforms) {
      try {
        if (platform.toLowerCase() === "twitter") {
          // Use the existing Twitter posting functionality
          const twitterResponse = await fetch(
            `http://localhost:5001/api/social/twitter/post`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: req.headers.authorization,
              },
              body: JSON.stringify({
                text: content,
                imageUrl: mediaUrl,
              }),
            }
          );

          const twitterResult = await twitterResponse.json();
          results.push({
            platform: "twitter",
            success: twitterResult.success,
            data: twitterResult,
          });
        }
        // Add other platforms here (Instagram, LinkedIn, etc.)
      } catch (platformError) {
        console.error(`Error posting to ${platform}:`, platformError);
        results.push({
          platform,
          success: false,
          error: platformError.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Post published",
      results,
    });
  } catch (error) {
    console.error("Error posting now:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get posting statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get total posts count
    const { count: totalPosts, error: totalError } = await supabase
      .from("scheduled_posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalError) {
      console.error("Error fetching total posts:", totalError);
    }

    // Get posts by status
    const { data: statusData, error: statusError } = await supabase
      .from("scheduled_posts")
      .select("status")
      .eq("user_id", userId);

    if (statusError) {
      console.error("Error fetching status data:", statusError);
    }

    const statusCounts =
      statusData?.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get posts by platform
    const { data: platformData, error: platformError } = await supabase
      .from("scheduled_posts")
      .select("platform")
      .eq("user_id", userId);

    if (platformError) {
      console.error("Error fetching platform data:", platformError);
    }

    const platformCounts =
      platformData?.reduce((acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {}) || {};

    res.json({
      success: true,
      data: {
        totalPosts: totalPosts || 0,
        byStatus: statusCounts,
        byPlatform: platformCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get posts by status (for monitoring)
router.get("/status/:status", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data: posts, error } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts (
          platform,
          accountName
        )
      `
      )
      .eq("userId", userId)
      .eq("status", status.toUpperCase())
      .order("scheduledTime", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching posts by status:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    res.json({
      success: true,
      data: posts || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: posts?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error in get posts by status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel a scheduled post
router.post("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Check if post exists and belongs to user
    const { data: post, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", id)
      .eq("userId", userId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Can only cancel pending posts
    if (post.status !== "PENDING") {
      return res.status(400).json({
        error: `Cannot cancel post with status: ${post.status}`,
      });
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error cancelling post:", updateError);
      return res.status(500).json({ error: "Failed to cancel post" });
    }

    res.json({
      success: true,
      message: "Post cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancel post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retry a failed post
router.post("/:id/retry", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { newScheduledTime } = req.body;

    // Check if post exists and belongs to user
    const { data: post, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", id)
      .eq("userId", userId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Can only retry failed posts
    if (post.status !== "FAILED") {
      return res.status(400).json({
        error: `Cannot retry post with status: ${post.status}`,
      });
    }

    const scheduledTime = newScheduledTime
      ? new Date(newScheduledTime)
      : new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Validate scheduled time is in the future
    if (scheduledTime <= new Date()) {
      return res.status(400).json({
        error: "Scheduled time must be in the future",
      });
    }

    // Reset post for retry
    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({
        status: "PENDING",
        scheduledTime: scheduledTime.toISOString(),
        error: null,
        retryCount: 0,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error retrying post:", updateError);
      return res.status(500).json({ error: "Failed to retry post" });
    }

    res.json({
      success: true,
      message: "Post scheduled for retry",
      scheduledTime: scheduledTime.toISOString(),
    });
  } catch (error) {
    console.error("Error in retry post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get detailed post information
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts (
          platform,
          accountName,
          isActive
        )
      `
      )
      .eq("id", id)
      .eq("userId", userId)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get available posting options and connected accounts
router.get("/options/available", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get connected social accounts
    const { data: socialAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("id, platform, accountName, isActive")
      .eq("userId", userId)
      .eq("isActive", true);

    if (accountsError) {
      console.error("Error fetching social accounts:", accountsError);
      return res.status(500).json({ error: "Failed to fetch social accounts" });
    }

    // Available posting options
    const postingOptions = {
      mediaTypes: [
        { value: "IMAGE", label: "Image", description: "JPG, PNG, GIF images" },
        { value: "VIDEO", label: "Video", description: "MP4, MOV videos" },
        { value: "GIF", label: "GIF", description: "Animated GIF files" },
      ],
      postTypes: [
        {
          value: "STANDARD",
          label: "Standard Post",
          description: "Regular social media post",
        },
        {
          value: "THREAD",
          label: "Thread",
          description: "Multi-part post series",
        },
        {
          value: "REPLY",
          label: "Reply",
          description: "Reply to existing post",
        },
        {
          value: "RETWEET",
          label: "Retweet",
          description: "Share existing content",
        },
      ],
      platforms: socialAccounts.map((account) => ({
        platform: account.platform,
        accountName: account.accountName,
        features: getPlatformFeatures(account.platform),
      })),
      advancedOptions: {
        useUserTokens: {
          label: "Use Personal Tokens",
          description: "Use your personal social media tokens for posting",
          default: true,
        },
        fallbackToGlobal: {
          label: "Fallback to App Tokens",
          description: "Use app tokens if personal tokens fail",
          default: true,
        },
        retryOnFailure: {
          label: "Auto Retry Failed Posts",
          description: "Automatically retry failed posts",
          default: true,
        },
        maxRetries: {
          label: "Maximum Retries",
          description: "Number of retry attempts for failed posts",
          default: 3,
          min: 0,
          max: 5,
        },
      },
    };

    res.json({
      success: true,
      data: {
        connectedAccounts: socialAccounts,
        postingOptions,
        limits: {
          contentLength: {
            TWITTER: 280,
            LINKEDIN: 3000,
            INSTAGRAM: 2200,
          },
          mediaSize: {
            maxImageSize: "5MB",
            maxVideoSize: "512MB",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching posting options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get platform-specific features
function getPlatformFeatures(platform) {
  const features = {
    TWITTER: {
      textPosts: true,
      mediaPosts: true,
      threads: true,
      polls: false,
      scheduling: true,
      analytics: false,
    },
    LINKEDIN: {
      textPosts: true,
      mediaPosts: true,
      threads: false,
      polls: true,
      scheduling: true,
      analytics: false,
    },
    INSTAGRAM: {
      textPosts: false,
      mediaPosts: true,
      threads: false,
      polls: false,
      scheduling: true,
      analytics: false,
    },
  };

  return features[platform] || {};
}

// Schedule multiple posts at once (bulk scheduling)
router.post("/schedule/bulk", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { posts } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        error: "Posts array is required and cannot be empty",
      });
    }

    if (posts.length > 10) {
      return res.status(400).json({
        error: "Cannot schedule more than 10 posts at once",
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        // Validate each post
        if (!post.content || !post.scheduledAt) {
          errors.push({
            index: i,
            error: "Content and scheduled time are required",
          });
          continue;
        }

        const scheduledDate = new Date(post.scheduledAt);
        if (scheduledDate <= new Date()) {
          errors.push({
            index: i,
            error: "Scheduled time must be in the future",
          });
          continue;
        }

        // Process the post (simplified version of single post logic)
        const platforms = post.platforms || ["twitter"];
        const postOptions = post.postOptions || {};

        for (const platform of platforms) {
          const { data: socialAccount, error: socialError } = await supabase
            .from("social_accounts")
            .select("id")
            .eq("userId", userId)
            .eq("platform", platform.toUpperCase())
            .eq("isActive", true)
            .single();

          if (socialError || !socialAccount) {
            errors.push({
              index: i,
              platform,
              error: `No connected ${platform} account found`,
            });
            continue;
          }

          const { data: scheduledPost, error: postError } = await supabase
            .from("scheduled_posts")
            .insert({
              userId,
              socialAccountId: socialAccount.id,
              content: post.content,
              mediaUrl: post.mediaUrl || null,
              mediaType: post.mediaType ? post.mediaType.toUpperCase() : null,
              scheduledTime: scheduledDate.toISOString(),
              status: "PENDING",
              platform: platform.toUpperCase(),
              maxRetries: postOptions.retryOnFailure
                ? postOptions.maxRetries || 3
                : 0,
              useUserTokens: postOptions.useUserTokens !== false,
              fallbackToGlobal: postOptions.fallbackToGlobal !== false,
              postType: (postOptions.postType || "standard").toUpperCase(),
              postOptions: {
                ...postOptions,
                bulkScheduled: true,
                bulkIndex: i,
              },
            })
            .select()
            .single();

          if (postError) {
            errors.push({
              index: i,
              platform,
              error: `Failed to create scheduled post: ${postError.message}`,
            });
          } else {
            results.push(scheduledPost);
          }
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        scheduled: results,
        errors: errors,
        summary: {
          total: posts.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    console.error("Error bulk scheduling posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get posting templates
router.get("/templates", authMiddleware, async (req, res) => {
  try {
    const templates = [
      {
        id: "announcement",
        name: "Announcement",
        description: "General announcement template",
        content: "🎉 Exciting news! [Your announcement here] #announcement",
        mediaType: "IMAGE",
        platforms: ["TWITTER", "LINKEDIN"],
      },
      {
        id: "promotion",
        name: "Product Promotion",
        description: "Promote a product or service",
        content:
          "✨ Check out our latest [product/service]! [Description] [Link] #promotion",
        mediaType: "IMAGE",
        platforms: ["TWITTER", "INSTAGRAM", "LINKEDIN"],
      },
      {
        id: "update",
        name: "Status Update",
        description: "Share a status or progress update",
        content: "📈 Progress update: [Your update here] #progress #update",
        platforms: ["TWITTER", "LINKEDIN"],
      },
      {
        id: "question",
        name: "Engagement Question",
        description: "Ask a question to engage your audience",
        content:
          "🤔 Quick question for you: [Your question here]? Let me know in the comments! #engagement",
        platforms: ["TWITTER", "LINKEDIN"],
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
