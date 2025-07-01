// models/eventModel.js
const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

const eventModel = {
  getAllEvents: async () => {
    const { eventCollection } = getCollections();
    return await eventCollection.find().toArray();
  },
  getMyEvents: async (userId) => {
    const { eventCollection } = getCollections();
    return await eventCollection
      .find({ creatorId: new ObjectId(userId) })
      .toArray();
  },
  postEvents: async (eventData) => {
    const { eventCollection } = getCollections();
    const eventWithDefaults = {
      ...eventData,
      attendeeCount: 0,
      attendees: [],
    };
    const result = await eventCollection.insertOne(eventWithDefaults);
    return { ...eventWithDefaults, _id: result.insertedId };
  },
  putEvents: async (eventId, eventData) => {
    const { eventCollection } = getCollections();
    const result = await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: eventData },
      { upsert: false }
    );
    if (result.matchedCount === 0) {
      throw new Error("Event not found");
    }
    return { ...eventData, _id: eventId };
  },
  patchEvents: async (eventId, { email }) => {
    const { eventCollection } = getCollections();
    const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.attendees && event.attendees.includes(email)) {
      throw new Error("User has already joined this event");
    }
    const result = await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      {
        $inc: { attendeeCount: 1 },
        $addToSet: { attendees: email }, // Store email in attendees
      },
      { upsert: false }
    );
    if (result.matchedCount === 0) {
      throw new Error("Event not found");
    }
    return {
      _id: eventId,
      attendeeCount: (event.attendeeCount || 0) + 1,
      attendees: [...(event.attendees || []), email],
    };
  },
  deleteEvents: async (eventId) => {
    const { eventCollection } = getCollections();
    const result = await eventCollection.deleteOne({
      _id: new ObjectId(eventId),
    });
    if (result.deletedCount === 0) {
      throw new Error("Event not found");
    }
    return { success: true, eventId };
  },
  // Add this method to fetch a single event by ID (used in controllers)
  getEventById: async (eventId) => {
    const { eventCollection } = getCollections();
    return await eventCollection.findOne({ _id: new ObjectId(eventId) });
  },
};

module.exports = eventModel;
