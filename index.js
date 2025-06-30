const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use(userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("OTA is running");
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`OTA is running on port ${port}`);
  });
}

startServer().catch(console.dir);
