import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
}, { timestamps: true });

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
