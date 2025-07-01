const { getCollections } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const { userCollection } = getCollections();

    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.authToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await userCollection.findOne({ token });

    if (!user || user.tokenExpiresAt < new Date()) {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authMiddleware;
