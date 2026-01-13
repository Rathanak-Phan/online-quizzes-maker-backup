import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["admin","teacher","user"], default: "user" },
  validated: { type: Boolean, default: false }, // teacher validation by admin
  social: { googleId: String, facebookId: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
