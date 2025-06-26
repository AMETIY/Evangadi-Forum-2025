import db from "../config/dbConnection.js"; // My Universal adapter
import {
  users,
  questions,
  answers,
  profiles,
  password_history,
} from "../schema/tables.js";

const createTableIfNotExists = async (tableName, createStatement) => {
  try {
    // Checking if table exists (ThIS CHECK Works for both databases)
    let checkQuery;
    let dbName;

    if (process.env.DB_TYPE === "postgres") {
      checkQuery =
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?";
      dbName = tableName;
    } else {
      checkQuery =
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
      dbName = process.env.DB_NAME || "evangadi-db";
    }

    const result = await db.query(
      checkQuery,
      process.env.DB_TYPE === "postgres" ? [tableName] : [dbName, tableName]
    );

    if (result.rows.length === 0) {
      await db.query(createStatement);
      console.info(`✅ Table ${tableName} created successfully.`);
    } else {
      console.info(`✅ Table ${tableName} already exists, skipping creation.`);
    }
  } catch (err) {
    console.error(
      `❌ Error checking/creating table ${tableName}:`,
      err.message
    );
    throw err;
  }
};

// Checking and add missing columns to existing users table
const updateUsersTableForPasswordReset = async () => {
  try {
    // Check if reset columns exist (works for both databases)
    let columnsQuery;

    if (process.env.DB_TYPE === "postgres") {
      columnsQuery = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'`;
    } else {
      columnsQuery = `SELECT COLUMN_NAME as column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`;
    }

    const result = await db.query(
      columnsQuery,
      process.env.DB_TYPE === "postgres"
        ? []
        : [process.env.DB_NAME || "evangadi-db"]
    );

    const columnNames = result.rows.map((col) => col.column_name);

    //missing columns
    if (!columnNames.includes("reset_token")) {
      await db.query(
        "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL"
      );
      console.info("✅ Added reset_token column to users table");
    }

    if (!columnNames.includes("reset_token_expires")) {
      const dateType =
        process.env.DB_TYPE === "postgres" ? "TIMESTAMP" : "DATETIME";
      await db.query(
        `ALTER TABLE users ADD COLUMN reset_token_expires ${dateType} DEFAULT NULL`
      );
      console.info("✅ Added reset_token_expires column to users table");
    }

    if (!columnNames.includes("last_password_reset")) {
      const dateType =
        process.env.DB_TYPE === "postgres" ? "TIMESTAMP" : "DATETIME";
      await db.query(
        `ALTER TABLE users ADD COLUMN last_password_reset ${dateType} DEFAULT NULL`
      );
      console.info("✅ Added last_password_reset column to users table");
    }

    // Add indexes if they don't exist
    try {
      if (process.env.DB_TYPE === "postgres") {
        await db.query(
          "CREATE INDEX IF NOT EXISTS idx_reset_token ON users(reset_token)"
        );
        await db.query(
          "CREATE INDEX IF NOT EXISTS idx_reset_expires ON users(reset_token_expires)"
        );
      } else {
        const [rows] = await db.query(
          "SHOW INDEX FROM users WHERE Key_name = 'idx_reset_token'"
        );
        if (rows.length === 0) {
          await db.query("CREATE INDEX idx_reset_token ON users(reset_token)");
        }
        await db.query(
          "CREATE INDEX idx_reset_expires ON users(reset_token_expires)"
        );
      }
      console.info("✅ Created password reset indexes");
    } catch (err) {
      if (
        !err.message.includes("already exists") &&
        !err.message.includes("Duplicate key name")
      ) {
        console.error("Error creating indexes:", err.message);
      }
    }
  } catch (err) {
    console.error("Error updating users table:", err.message);
    throw err;
  }
};

export const createAllTables = async () => {
  try {
    console.info(
      `Initializing ${process.env.DB_TYPE || "mysql"} database tables...`
    );

    // Create tables in correct order (users first, then dependent tables)
    await createTableIfNotExists("users", users);
    await createTableIfNotExists("profiles", profiles);
    await createTableIfNotExists("questions", questions);
    await createTableIfNotExists("answers", answers);
    await createTableIfNotExists("password_history", password_history);

    // Update existing users table for password reset
    await updateUsersTableForPasswordReset();

    console.info("All tables initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing tables:", err.message);
    throw err;
  }
};
