const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://studyingalaxy123_db_user:2SeVY7ydsk7xeW7@online-quizzes-maker.cd0nedo.mongodb.net/online-quizzes?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "online-quizzes";

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      // remove useNewUrlParser and useUnifiedTopology
    });

    console.log("✅ MongoDB connected successfully!");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));

    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

testConnection();
