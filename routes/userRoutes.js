const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/events", userController.getAllEventsController);

module.exports = router;
