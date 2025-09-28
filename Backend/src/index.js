const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const { supabase } = require("./utils/database");
const ScheduledPostingService = require("./services/scheduledPostingService");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://frontenddautomation.onrender.com",
    ],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Health check route for API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "automation-backend",
  });
});

// Test Supabase connection
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Supabase connected successfully", data });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Supabase connection failed", message: err.message });
  }
});

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/social", require("./routes/social"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/posts", require("./routes/posts"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  scheduledPostingService.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Initialize and start scheduled posting service
const scheduledPostingService = new ScheduledPostingService();
scheduledPostingService.start();

// Start server
const server = app.listen(port, () => {
  console.log(` Server running on port ${port}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
  console.log(` Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(` Server listening and ready for connections...`);
});

// Keep the server alive
server.on("close", () => {
  console.log("❌ Server closed");
});

// // Add keep-alive mechanism
// setInterval(() => {
//   console.log(`💓 Server heartbeat: ${new Date().toISOString()}`);
// }, 30000);

// Prevent the process from exiting
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  scheduledPostingService.stop();
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = { app, supabase };
