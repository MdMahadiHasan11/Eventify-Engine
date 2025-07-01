// config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdildbx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let eventCollection;
let userCollection;

async function connectDB() {
  try {
    // await client.connect(); // Uncomment if needed for your MongoDB version
    const db = client.db("eventDB");
    eventCollection = db.collection("events");
    userCollection = db.collection("users");

    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = {
  connectDB,
  getCollections: () => ({
    eventCollection,
    userCollection,
  }),
};
