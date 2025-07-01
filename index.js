const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://eventify-one-liart.vercel.app",
      "http://localhost:5173",
      "http://localhost:5170",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use(cookieParser());

app.use(authRoutes);
app.use(userRoutes);
app.use(eventRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Eventify  API is running");
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Eventify server is running on port ${port}`);
  });
}

startServer().catch(console.dir);
