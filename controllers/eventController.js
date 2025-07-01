const eventModel = require("../models/eventModel");

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
      const result = await eventModel.getMyEvents();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  postEventsController: async (req, res) => {
    try {
      const eventData = req.body;
      const result = await eventModel.postEvents(eventData);
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
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
      }
      const result = await eventModel.patchEvents(eventId, { user_id });
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
