const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { hashPassword } = require("../utils/hash");
const { getCollections } = require("../config/db");

// Input validation
const validateUserInput = (username, email, password) => {
  if (!username || typeof username !== "string" || username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email format";
  }
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

// Middleware to verify token
const authMiddleware = async (req, res, next) => {
  const { userCollection } = getCollections();
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = await userCollection.findOne({ token });
    if (!user || user.tokenExpiresAt < new Date()) {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/register", async (req, res) => {
  const { userCollection } = getCollections();
  const { username, email, password, photoURL } = req.body;

  // Validate input, photoURL is optional
  const validationError = validateUserInput(username, email, password);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const exists = await userCollection.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const { hash, salt } = hashPassword(password);
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = {
      username,
      email,
      photoURL: photoURL || null, // Set to null if not provided
      passwordHash: hash,
      salt,
      token,
      tokenExpiresAt,
      followers: [],
      following: [],
    };

    await userCollection.insertOne(user);

    res
      .cookie("authToken", token, {
        httpOnly: true,
        expires: tokenExpiresAt,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(201)
      .json({
        message: "User registered and logged in",
        user: { username, email, photoURL: photoURL || null },
      });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { userCollection } = getCollections();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userCollection.updateOne(
      { email },
      { $set: { token, tokenExpiresAt } }
    );

    res
      .cookie("authToken", token, {
        httpOnly: true,
        expires: tokenExpiresAt,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({
        message: "Login successful",
        user: {
          username: user.username,
          email: user.email,
          photoURL: user.photoURL || null, // Ensure photoURL is included
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  const { userCollection } = getCollections();
  const token = req.cookies.authToken;

  try {
    await userCollection.updateOne(
      { token },
      { $unset: { token: "", tokenExpiresAt: "" } }
    );

    res.clearCookie("authToken").json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/verify-token", async (req, res) => {
  const { userCollection } = getCollections();
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  try {
    const user = await userCollection.findOne({ token });
    if (!user || user.tokenExpiresAt < new Date()) {
      res.clearCookie("authToken");
      return res
        .status(401)
        .json({ valid: false, message: "Invalid or expired token" });
    }

    res.json({
      valid: true,
      user: {
        username: user.username,
        email: user.email,
        photoURL: user.photoURL || null,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

router.post("/follow/:userId", authMiddleware, async (req, res) => {
  const { userCollection } = getCollections();
  const { userId } = req.params;
  const currentUser = req.user;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser._id.toString() === userId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    await userCollection.updateOne(
      { _id: currentUser._id },
      { $addToSet: { following: new ObjectId(userId) } }
    );

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { followers: currentUser._id } }
    );

    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/unfollow/:userId", authMiddleware, async (req, res) => {
  const { userCollection } = getCollections();
  const { userId } = req.params;
  const currentUser = req.user;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await userCollection.updateOne(
      { _id: currentUser._id },
      { $pull: { following: new ObjectId(userId) } }
    );

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { followers: currentUser._id } }
    );

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
