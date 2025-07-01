const eventModel = require("../models/eventModel");
const { ObjectId } = require("mongodb");

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
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user._id;
      const result = await eventModel.getMyEvents(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching user's events:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  postEventsController: async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const eventData = req.body;
      const userId = req.user._id;

      // Validate required fields
      if (
        !eventData.title ||
        !eventData.dateTime ||
        !eventData.location ||
        !eventData.description
      ) {
        return res.status(400).json({
          error: "Title, dateTime, location, and description are required",
        });
      }

      // Validate dateTime format
      const eventDate = new Date(eventData.dateTime);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Check if event date is in the future
      if (eventDate <= new Date()) {
        return res
          .status(400)
          .json({ error: "Event date must be in the future" });
      }

      const eventWithUser = {
        ...eventData,
        creatorId: new ObjectId(userId),
        name: req.user.username || req.user.email, // Add creator name
        attendeeCount: 0, // Initialize attendee count
        attendees: [], // Initialize attendees array
        createdAt: new Date(),
        updatedAt: new Date(),
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
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const eventId = req.params.eventId;
      const eventData = req.body;
      const userId = req.user._id;

      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      // Validate required fields
      if (
        !eventData.title ||
        !eventData.dateTime ||
        !eventData.location ||
        !eventData.description
      ) {
        return res.status(400).json({
          error: "Title, dateTime, location, and description are required",
        });
      }

      // Validate dateTime format
      const eventDate = new Date(eventData.dateTime);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const event = await eventModel.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user is the creator of the event
      if (event.creatorId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this event" });
      }

      // Add updatedAt timestamp
      const updatedEventData = {
        ...eventData,
        updatedAt: new Date(),
      };

      const result = await eventModel.putEvents(eventId, updatedEventData);
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
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const eventId = req.params.eventId;
      const userId = req.user._id;

      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await eventModel.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user is the creator of the event
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
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const eventId = req.params.eventId;
      const { email } = req.body;
      const currentUserEmail = req.user.email;

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
