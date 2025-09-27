const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../utils/database");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        error: "Email, username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email, username")
      .or(
        `email.eq.${email.toLowerCase()},username.eq.${username.toLowerCase()}`
      )
      .single();

    if (existingUser && !checkError) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: createError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      })
      .select("id, email, username, firstName, lastName, createdAt")
      .single();

    if (createError) {
      console.error("User creation error:", createError);
      return res.status(500).json({
        error: "Failed to create user",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error during registration",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, username, password, firstName, lastName")
      .eq("email", email.toLowerCase())
      .single();

    if (findError || !user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error during login",
    });
  }
});

// Get current user endpoint
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, username, firstName, lastName, createdAt, updatedAt")
      .eq("id", req.user.userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Logout endpoint (for completeness - JWT is stateless)
router.post("/logout", authMiddleware, (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = router;
