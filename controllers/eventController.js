// controllers/eventController.js
const eventModel = require("../models/eventModel");
const { ObjectId } = require("mongodb");
const { authMiddleware } = require("../middleware/verifyAuth");

const eventController = {
  getAllEventsController: async (req, res) => {
    try {
      const result = await eventModel.getAllEvents();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getMyEventsController: async (req, res) => {
    try {
      const userId = req.user._id; // Authenticated user's ID
      const result = await eventModel.getMyEvents(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching user's events:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  postEventsController: async (req, res) => {
    try {
      const eventData = req.body;
      const userId = req.user._id;

      // if (!eventData.title || !eventData.date || !eventData.location) {
      //   return res
      //     .status(400)
      //     .json({ error: "Title, date, and location are required" });
      // }

      const eventWithUser = {
        ...eventData,
        creatorId: userId,
        createdAt: new Date(),
      };

      const result = await eventModel.postEvents(eventWithUser);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  putEventsController: async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const eventData = req.body;
      const userId = req.user._id;

      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await eventModel.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.creatorId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this event" });
      }

      const result = await eventModel.putEvents(eventId, eventData);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(error.message === "Event not found" ? 404 : 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  },
  deleteEventsController: async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user._id;

      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await eventModel.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.creatorId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this event" });
      }

      const result = await eventModel.deleteEvents(eventId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(error.message === "Event not found" ? 404 : 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  },
  patchAllEventsController: async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const { email } = req.body;
      const currentUserEmail = req.user.email; // From authMiddleware

      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email is required" });
      }
      if (email !== currentUserEmail) {
        return res
          .status(403)
          .json({ error: "Unauthorized to join with this email" });
      }

      const result = await eventModel.patchEvents(eventId, { email });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating event:", error);
      res
        .status(
          error.message === "Event not found" ||
            error.message === "User has already joined this event"
            ? 400
            : 500
        )
        .json({
          error: error.message || "Internal Server Error",
        });
    }
  },
};

module.exports = eventController;
