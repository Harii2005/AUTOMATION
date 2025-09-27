const express = require("express");
const OpenAI = require("openai");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Initialize GROK (xAI) - uses OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: process.env.GROK_API_URL || "https://api.x.ai/v1",
});

// Create a new conversation
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.userId,
        title: title || "New Conversation",
      },
      include: {
        messages: true,
      },
    });

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get user's conversations
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.userId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
          take: 1, // Get only the first message for preview
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Get conversation with messages
router.get("/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// Generate content using GROK (xAI)
router.post("/generate-content", authMiddleware, async (req, res) => {
  try {
    const {
      conversationId,
      prompt,
      contentType = "text_post",
      platform = "general",
      tone = "professional",
      length = "medium",
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Skip conversation verification for now (TODO: Convert to Supabase)
    console.log("Received prompt:", prompt);
    console.log(
      "GROK API Key present:",
      process.env.GROK_API_KEY ? "Yes" : "No"
    );

    // Skip storing user message for now (TODO: Convert to Supabase)
    // const userMessage = await supabase.from("messages").insert({...});

    // Create system prompt based on content type
    let systemPrompt = "";

    switch (contentType) {
      case "text_post":
        systemPrompt = `You are a social media content creator. Create engaging ${tone} text posts for ${platform}. Length: ${length}. Focus on creating valuable, shareable content.`;
        break;
      case "caption_with_image":
        systemPrompt = `You are a social media content creator. Create compelling captions for ${platform} posts with image ideas. Include relevant hashtags and suggest image concepts. Tone: ${tone}, Length: ${length}.`;
        break;
      case "video_script":
        systemPrompt = `You are a video content creator. Write engaging video scripts for ${platform}. Include hook, main content, and call-to-action. Tone: ${tone}, Length: ${length}.`;
        break;
      default:
        systemPrompt = `You are a helpful AI assistant for social media content creation. Create engaging content based on the user's request.`;
    }

    // Simple message setup for GROK testing (TODO: Add conversation history from Supabase)
    let messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    // Call GROK API
    const completion = await openai.chat.completions.create({
      model: process.env.GROK_MODEL || "grok-beta",
      messages: messages,
      max_tokens: length === "short" ? 150 : length === "long" ? 500 : 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Skip storing AI response for now (TODO: Convert to Supabase)
    console.log("GROK Response:", aiResponse);

    // Skip conversation update for now (TODO: Convert to Supabase)

    res.json({
      generatedContent: aiResponse,
      message: "Response generated successfully",
      metadata: {
        contentType,
        platform,
        tone,
        length,
      },
    });
  } catch (error) {
    console.error("Generate content error:", error);

    if (error.code === "insufficient_quota") {
      return res.status(429).json({
        error: "GROK API quota exceeded. Please check your API usage.",
      });
    }

    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Delete conversation
router.delete("/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await prisma.conversation.delete({
      where: { id: id },
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// Update conversation title
router.put("/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: id },
      data: { title },
    });

    res.json({
      message: "Conversation updated successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

module.exports = router;
