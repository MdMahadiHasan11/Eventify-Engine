// middleware/auth.js
const { getCollections } = require("../config/db");

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

module.exports = authMiddleware;
