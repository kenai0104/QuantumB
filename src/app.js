import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "./routes/askRoutes.js";
import db from "./config/db.js";
import cron from "node-cron";
import fetch from "node-fetch"; // Use this if Node < v18

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Routes
app.use("/api", routes);

// ✅ Health check endpoints
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});


// Server startup
async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Connected to the database successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    cron.schedule("*/1 * * * *", async () => {
      const url = "https://quantumb.onrender.com/api/ping"; // or /api/ping based on your route
      console.log(`[CRON] Self-ping at ${new Date().toLocaleTimeString()}`);

      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log("✅ Self-ping successful.");
        } else {
          console.error("⚠️ Self-ping failed with status:", response.status);
        }
      } catch (error) {
        console.error("❌ Self-ping error:", error.message);
      }
    });

  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();
