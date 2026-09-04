const mongoose = require("mongoose");
require("dotenv").config();

// Disable buffering globally so Mongoose operations fail fast if DB is disconnected
mongoose.set("bufferCommands", false);

/**
 * Resolves environment-specific database name
 */
const getDatabaseName = () => {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME.trim();
  }
  const nodeEnv = (process.env.NODE_ENV || "development").toLowerCase().trim();
  switch (nodeEnv) {
    case "production":
    case "prod":
      return "golive_prod";
    case "staging":
    case "stage":
      return "golive_stage";
    default:
      return "golive_dev";
  }
};

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn("⚠ MONGODB_URI not provided in .env");
      return;
    }

    const dbName = getDatabaseName();
    const nodeEnv = process.env.NODE_ENV || "development";

    await mongoose.connect(mongoUri, {
      tls: true,
      dbName,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log(`✓ MongoDB Connected to isolated database: [${dbName}] (${nodeEnv} environment)`);
  } catch (err) {
    console.warn("⚠ MongoDB connection notice:", err.message);
  }
};

module.exports = connectMongoDB;
module.exports.getDatabaseName = getDatabaseName;
