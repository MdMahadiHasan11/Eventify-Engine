const { getCollections } = require("../config/db");

const userModel = {
  getAllEvents: async () => {
    const { eventCollection } = getCollections();
    return await eventCollection.find().toArray();
  },
};

module.exports = userModel;
