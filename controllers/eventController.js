const eventModel = require("../models/eventModel");
require("dotenv").config();

const eventController = {
  getAllEventsController: async (req, res) => {
    try {
      const result = await eventModel.getAllEvents();
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = eventController;
