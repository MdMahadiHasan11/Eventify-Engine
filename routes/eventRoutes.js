const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/events/all", eventController.getAllEventsController);
router.patch("/events/all/:eventId", eventController.patchAllEventsController);
router.get("/events", eventController.getMyEventsController);
router.post("/events", eventController.postEventsController);
router.put("/events/:eventId", eventController.putEventsController);
router.delete("/events/:eventId", eventController.deleteEventsController);

module.exports = router;
