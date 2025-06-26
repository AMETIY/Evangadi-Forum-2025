import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import db from "./config/dbConnection.js"; // My Universal adapter
import { createAllTables } from "./controllers/createAllTables.js";
import userRoute from "./Routes/userRoute.js";
import questionRoute from "./Routes/questionRoute.js";
import answerRoute from "./Routes/answerRoute.js";
import passwordResetRoutes from "./Routes/passwordResetRoutes.js";
import { testEmailSetup } from "./services/emailService.js";
import { cleanupExpiredTokens } from "./controllers/passwordResetController.js";

const app = express();
const port = process.env.PORT || 5500;

// ✅ Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://amanuelwubneh.com",
        "https://evangadi-forum-frontend.vercel.app",
        "https://evangadi-forum.vercel.app",
        "http://localhost:5000",
        "http://localhost:5173",
        "http://localhost:3000",
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", userRoute);
app.use("/api/questions", questionRoute);
app.use("/api/answers", answerRoute);
app.use("/api/auth", passwordResetRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Test Database Connection (works for both!)
const testConnection = async () => {
  try {
    await db.query("SELECT 1");
    console.log(
      `✅ Database connection successful (${process.env.DB_TYPE || "mysql"})`
    );
    return true;
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    return false;
  }
};

// Starting the server
const startServer = async () => {
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error("❌ Failed to connect to database. Exiting...");
    process.exit(1);
  }

  // Testing email configuration
  await testEmailSetup();

  if (process.env.INIT_DB === "true") {
    try {
      await createAllTables();
    } catch (err) {
      console.error("❌ Failed to initialize tables. Exiting...");
      process.exit(1);
    }
  }

  // Periodic cleanup
  setInterval(() => {
    cleanupExpiredTokens();
  }, 60 * 60 * 1000);

  // Start listening
  app.listen(port, () => {
    console.info(`✨ Server listening on port ${port}`);
    console.info(`✨ API available at: http://localhost:${port}/api`);
    console.info(`📊 Database: ${process.env.DB_TYPE || "mysql"}`);
  });
};

startServer();
