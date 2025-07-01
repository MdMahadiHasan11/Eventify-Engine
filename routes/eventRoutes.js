const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/verifyAuth"); // Use the correct auth middleware

// Public route - no auth required
router.get("/events/all", eventController.getAllEventsController);

// Protected routes - require authentication
router.get("/events", authMiddleware, eventController.getMyEventsController);
router.post("/events", authMiddleware, eventController.postEventsController);
router.put(
  "/events/:eventId",
  authMiddleware,
  eventController.putEventsController
);
router.patch(
  "/events/all/:eventId",
  authMiddleware,
  eventController.patchAllEventsController
);
router.delete(
  "/events/:eventId",
  authMiddleware,
  eventController.deleteEventsController
);

module.exports = router;
