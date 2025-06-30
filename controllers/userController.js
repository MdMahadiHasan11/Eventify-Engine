const userModel = require("../models/userModel");
require("dotenv").config();

const userController = {
  getAllEventsController: async (req, res) => {
    try {
      const result = await userModel.getAllEvents();
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = userController;
