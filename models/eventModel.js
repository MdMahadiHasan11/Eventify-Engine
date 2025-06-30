const { getCollections } = require("../config/db");

const eventModel = {
  getAllEvents: async () => {
    const { eventCollection } = getCollections();
    return await eventCollection.find().toArray();
  },
};

module.exports = eventModel;
