import { createAllTables } from "./controllers/createAllTables.js";
import db from "./config/dbConnection.js";

const runMigrations = async () => {
  try {
    console.log("🚀 Starting database migrations...");

    // Create all tables including the new ones
    await createAllTables();

    console.log("✅ All migrations completed successfully!");
    console.log("📊 New tables created:");
    console.log("   - question_views (for tracking question views)");
    console.log("   - question_likes (for tracking question likes)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
};

runMigrations();
