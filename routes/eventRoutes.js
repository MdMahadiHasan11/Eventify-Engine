const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/events", eventController.getAllEventsController);

module.exports = router;
