const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

const eventModel = {
  getAllEvents: async () => {
    const { eventCollection } = getCollections();
    return await eventCollection.find().toArray();
  },
  getMyEvents: async () => {
    const { eventCollection } = getCollections();
    return await eventCollection.find().toArray();
  },
  postEvents: async (eventData) => {
    const { eventCollection } = getCollections();
    // Initialize attendeeCount and attendees array
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
  patchEvents: async (eventId, { user_id }) => {
    const { eventCollection } = getCollections();
    // Check if user_id is already in attendees
    const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.attendees && event.attendees.includes(user_id)) {
      throw new Error("User has already joined this event");
    }
    // Update attendeeCount and add user_id to attendees
    const result = await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      {
        $inc: { attendeeCount: 1 },
        $addToSet: { attendees: user_id }, // $addToSet prevents duplicates
      },
      { upsert: false }
    );
    if (result.matchedCount === 0) {
      throw new Error("Event not found");
    }
    return {
      _id: eventId,
      attendeeCount: (event.attendeeCount || 0) + 1,
      attendees: [...(event.attendees || []), user_id],
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
};

module.exports = eventModel;
