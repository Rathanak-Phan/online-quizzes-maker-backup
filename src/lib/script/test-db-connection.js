const mongoose = require("mongoose");

// MongoDB connection info
const MONGODB_URI =
  "mongodb+srv://studyingalaxy123_db_user:2SeVY7ydsk7xeW7@online-quizzes-maker.cd0nedo.mongodb.net/online-quizzes?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "online-quizzes";

// 1️⃣ Define User schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["admin", "teacher", "user"],
      default: "user",
    },
    validated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "active",
    },
  },
  { timestamps: true }
);

// 2️⃣ Create User model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// 3️⃣ Main function to connect, insert teachers, and disconnect
async function insertTeachers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log("✅ MongoDB connected successfully!");

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:", collections.map((c) => c.name));

    // Insert 10 pending teachers
    const teachers = [];
    for (let i = 1; i <= 10; i++) {
      teachers.push({
        name: `User ${i}`,
        email: `user${i}@gmail.com`,
        password: "$2b$12$ML0VA7mWT/.pIOKwX/Lk2u2Dfoy1blVr4Z6G/Tf6G7cQqtMuwsd8K",
        role: "user",
        status: "pending",
        validated: false,
      });
    }

    const inserted = await User.insertMany(teachers, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} pending teachers!`);

    // Disconnect
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  } catch (err) {
    console.error("❌ Error:", err);
    await mongoose.disconnect();
  }
}

// Run the script
insertTeachers();
