const express = require("express");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Schedule a new post
router.post("/schedule", authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, scheduledAt, platforms } = req.body;
    const { userId } = req.user;

    // Validation
    if (!content || !scheduledAt) {
      return res.status(400).json({
        error: "Content and scheduled time are required",
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
        .eq("user_id", userId)
        .eq("is_connected", true);

      if (accountsError) {
        console.error("Error fetching social accounts:", accountsError);
        return res.status(500).json({ error: "Failed to fetch social accounts" });
      }

      targetPlatforms = socialAccounts.map(account => account.platform.toLowerCase());
    }

    // Create scheduled posts for each platform
    const scheduledPosts = [];
    for (const platform of targetPlatforms) {
      // Get the social account for this platform
      const { data: socialAccount, error: socialError } = await supabase
        .from("social_accounts")
        .select("id")
        .eq("user_id", userId)
        .eq("platform", platform.toLowerCase())
        .eq("is_connected", true)
        .single();

      if (socialError || !socialAccount) {
        console.warn(`No connected ${platform} account found for user ${userId}`);
        continue;
      }

      // Create scheduled post
      const { data: scheduledPost, error: postError } = await supabase
        .from("scheduled_posts")
        .insert({
          user_id: userId,
          social_account_id: socialAccount.id,
          content: content,
          media_url: mediaUrl || null,
          media_type: mediaType ? mediaType.toUpperCase() : null,
          scheduled_time: scheduledDate.toISOString(),
          status: "scheduled",
          platform: platform.toLowerCase(),
        })
        .select()
        .single();

      if (postError) {
        console.error(`Error creating scheduled post for ${platform}:`, postError);
        continue;
      }

      scheduledPosts.push(scheduledPost);
    }

    // Create scheduled post
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId: req.user.userId,
        socialAccountId,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        scheduledTime: scheduledDate,
        platform: platform.toUpperCase(),
        status: "PENDING",
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post scheduled successfully",
      scheduledPost,
    });
  } catch (error) {
    console.error("Schedule post error:", error);
    res.status(500).json({ error: "Failed to schedule post" });
  }
});

// Get user's scheduled posts
router.get("/scheduled", authMiddleware, async (req, res) => {
  try {
    const { status, platform, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (platform) {
      where.platform = platform.toUpperCase();
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where,
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: { scheduledTime: "asc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.scheduledPost.count({ where });

    res.json({
      scheduledPosts,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Get scheduled posts error:", error);
    res.status(500).json({ error: "Failed to get scheduled posts" });
  }
});

// Get scheduled posts for calendar view
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { userId: req.user.userId };

    if (startDate && endDate) {
      where.scheduledTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where,
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: { scheduledTime: "asc" },
    });

    // Format for calendar component
    const calendarEvents = scheduledPosts.map((post) => ({
      id: post.id,
      title:
        post.content.length > 50
          ? post.content.substring(0, 50) + "..."
          : post.content,
      start: post.scheduledTime,
      end: post.scheduledTime,
      platform: post.platform,
      status: post.status,
      accountName: post.socialAccount.accountName,
      fullContent: post.content,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    console.error("Get calendar posts error:", error);
    res.status(500).json({ error: "Failed to get calendar posts" });
  }
});

// Get single scheduled post
router.get("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const scheduledPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
    });

    if (!scheduledPost) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    res.json({ scheduledPost });
  } catch (error) {
    console.error("Get scheduled post error:", error);
    res.status(500).json({ error: "Failed to get scheduled post" });
  }
});

// Update scheduled post
router.put("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mediaUrl, mediaType, scheduledTime } = req.body;

    // Check if post exists and belongs to user
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
        status: "PENDING", // Only allow updating pending posts
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        error: "Scheduled post not found or cannot be updated",
      });
    }

    // Validate scheduled time if provided
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({
          error: "Scheduled time must be in the future",
        });
      }
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id: id },
      data: {
        content: content || undefined,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : undefined,
        mediaType: mediaType !== undefined ? mediaType : undefined,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
    });

    res.json({
      message: "Scheduled post updated successfully",
      scheduledPost: updatedPost,
    });
  } catch (error) {
    console.error("Update scheduled post error:", error);
    res.status(500).json({ error: "Failed to update scheduled post" });
  }
});

// Cancel/Delete scheduled post
router.delete("/scheduled/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const scheduledPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (!scheduledPost) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    // If post is pending, delete it. If posted, mark as cancelled
    if (scheduledPost.status === "PENDING") {
      await prisma.scheduledPost.delete({
        where: { id: id },
      });
      res.json({ message: "Scheduled post deleted successfully" });
    } else {
      await prisma.scheduledPost.update({
        where: { id: id },
        data: { status: "CANCELLED" },
      });
      res.json({ message: "Scheduled post cancelled successfully" });
    }
  } catch (error) {
    console.error("Delete scheduled post error:", error);
    res.status(500).json({ error: "Failed to delete scheduled post" });
  }
});

// Post immediately
router.post("/post-now", authMiddleware, async (req, res) => {
  try {
    const { socialAccountId, content, mediaUrl, mediaType, platform } =
      req.body;

    // Validation
    if (!socialAccountId || !content || !platform) {
      return res.status(400).json({
        error: "Social account ID, content, and platform are required",
      });
    }

    // Verify social account belongs to user
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        userId: req.user.userId,
        platform: platform.toUpperCase(),
        isActive: true,
      },
    });

    if (!socialAccount) {
      return res.status(404).json({
        error: "Social account not found or inactive",
      });
    }

    // Create and immediately "post" (mock posting for now)
    const post = await prisma.scheduledPost.create({
      data: {
        userId: req.user.userId,
        socialAccountId,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        scheduledTime: new Date(),
        platform: platform.toUpperCase(),
        status: "POSTED",
        platformPostId: "mock_post_id_" + Date.now(),
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post published successfully",
      post,
    });
  } catch (error) {
    console.error("Post now error:", error);
    res.status(500).json({ error: "Failed to publish post" });
  }
});

// Get posting analytics/stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await prisma.$transaction(async (prisma) => {
      const totalPosts = await prisma.scheduledPost.count({
        where: { userId },
      });

      const pendingPosts = await prisma.scheduledPost.count({
        where: { userId, status: "PENDING" },
      });

      const postedPosts = await prisma.scheduledPost.count({
        where: { userId, status: "POSTED" },
      });

      const failedPosts = await prisma.scheduledPost.count({
        where: { userId, status: "FAILED" },
      });

      const postsByPlatform = await prisma.scheduledPost.groupBy({
        by: ["platform"],
        where: { userId },
        _count: { platform: true },
      });

      const recentPosts = await prisma.scheduledPost.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          socialAccount: {
            select: {
              platform: true,
              accountName: true,
            },
          },
        },
      });

      return {
        totalPosts,
        pendingPosts,
        postedPosts,
        failedPosts,
        postsByPlatform,
        recentPosts,
      };
    });

    res.json({ stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get posting stats" });
  }
});

module.exports = router;
